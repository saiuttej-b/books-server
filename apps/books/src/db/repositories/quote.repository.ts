import { Quote, QuoteItem } from '@app/core';

export abstract class QuoteRepository {
  abstract instance(data?: Partial<Quote>): Quote;

  abstract itemInstance(data?: Partial<QuoteItem>): QuoteItem;

  abstract create(quote: Quote): Promise<void>;

  abstract addQuoteItems(items: QuoteItem[]): Promise<void>;

  abstract update(quote: Quote): Promise<void>;

  abstract deleteItemsByQuoteId(quoteId: string): Promise<void>;

  abstract delete(quoteId: string): Promise<void>;

  abstract existsByQuoteNo(props: {
    organizationId: string;
    quoteNo: string;
    excludeId?: string;
  }): Promise<boolean>;

  abstract findItemsByQuoteId(quoteId: string): Promise<QuoteItem[]>;

  abstract findById(props: {
    id: string;
    organizationId?: string;
    loadItem?: boolean;
  }): Promise<Quote | null>;

  abstract find(props: {
    organizationId: string;
    clientId?: string | null;
    projectId?: string | null;
    skip?: number | null;
    limit?: number | null;
  }): Promise<{ count: number; quotes: Quote[] }>;
}
