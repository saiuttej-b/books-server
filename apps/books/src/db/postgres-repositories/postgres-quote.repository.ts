import { generateId, Quote, QuoteItem } from '@app/core';
import { DbService } from '@app/infra';
import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import { QuoteRepository } from '../repositories/quote.repository';

@Injectable()
export class PostgresQuoteRepository implements QuoteRepository {
  constructor(private readonly dbService: DbService) {}

  instance(data?: Partial<Quote>): Quote {
    const record = this.dbService
      .getManager()
      .getRepository(Quote)
      .create(data || {});
    if (!record.id) record.id = generateId();
    return record;
  }

  itemInstance(data?: Partial<QuoteItem>): QuoteItem {
    const record = this.dbService
      .getManager()
      .getRepository(QuoteItem)
      .create(data || {});
    return record;
  }

  async create(quote: Quote): Promise<void> {
    await this.dbService.getWriteManager().insert(Quote, quote);
  }

  async addQuoteItems(items: QuoteItem[]): Promise<void> {
    if (items.length === 0) return;

    await this.dbService.getWriteManager().insert(QuoteItem, items);
  }

  async update(quote: Quote): Promise<void> {
    await this.dbService.getWriteManager().update(Quote, quote.id, quote);
  }

  async deleteItemsByQuoteId(quoteId: string): Promise<void> {
    await this.dbService.getWriteManager().delete(QuoteItem, { quoteId });
  }

  async delete(quoteId: string): Promise<void> {
    await this.dbService.getWriteManager().delete(Quote, { id: quoteId });
  }

  async existsByQuoteNo(props: {
    organizationId: string;
    quoteNo: string;
    excludeId?: string;
  }): Promise<boolean> {
    const count = await this.dbService.getManager().count(Quote, {
      where: {
        organizationId: props.organizationId,
        quoteNo: props.quoteNo,
        ...(props.excludeId ? { id: Not(props.excludeId) } : {}),
      },
    });
    return count > 0;
  }

  findItemsByQuoteId(quoteId: string): Promise<QuoteItem[]> {
    return this.dbService.getManager().find(QuoteItem, { where: { quoteId } });
  }

  findById(props: {
    id: string;
    organizationId?: string;
    loadItem?: boolean;
  }): Promise<Quote | null> {
    return this.dbService.getManager().findOne(Quote, {
      where: {
        id: props.id,
        ...(props.organizationId ? { organizationId: props.organizationId } : {}),
      },
      relations: props.loadItem ? { items: true } : undefined,
    });
  }

  async find(props: {
    organizationId: string;
    clientId?: string | null;
    projectId?: string | null;
    skip?: number | null;
    limit?: number | null;
  }): Promise<{ count: number; quotes: Quote[] }> {
    const builder = this.dbService
      .getManager()
      .createQueryBuilder(Quote, 'quote')
      .leftJoin('quote.project', 'project')
      .addSelect(['project.id', 'project.name', 'project.code', 'project.displayName'])
      .leftJoin('project.client', 'client')
      .addSelect(['client.id', 'client.name', 'client.displayName'])
      .where('quote.organizationId = :organizationId', { organizationId: props.organizationId });

    if (props.clientId) {
      builder.andWhere('project.clientId = :clientId', { clientId: props.clientId });
    }
    if (props.projectId) {
      builder.andWhere('quote.projectId = :projectId', { projectId: props.projectId });
    }

    const countBuilder = builder.clone();

    if (props.limit) {
      builder.take(props.limit);
    }
    if (props.skip) {
      builder.skip(props.skip);
      if (!props.limit) {
        builder.take(Number.MAX_SAFE_INTEGER);
      }
    }

    const [quotes, count] = await Promise.all([
      builder.orderBy('quote.createdAt', 'DESC').getMany(),
      countBuilder.getCount(),
    ]);

    return { count, quotes };
  }
}
