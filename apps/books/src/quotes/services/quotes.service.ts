import { AppRequestStoreService } from '@app/integrations';
import { Injectable, NotFoundException } from '@nestjs/common';
import { QuoteRepository } from '../../db/repositories/quote.repository';
import { QuotesGetDto } from '../dtos/quote.dto';

@Injectable()
export class QuotesService {
  constructor(
    private readonly quoteRepo: QuoteRepository,
    private readonly requestStore: AppRequestStoreService,
  ) {}

  getQuotes(query: QuotesGetDto) {
    return this.quoteRepo.find({
      organizationId: this.requestStore.getOrganizationId(),
      ...query,
    });
  }

  async getQuoteDetails(id: string) {
    const quote = await this.quoteRepo.findById({
      id,
      organizationId: this.requestStore.getOrganizationId(),
      loadItem: true,
    });
    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    return { quote };
  }
}
