import { Module } from '@nestjs/common';
import { QuotesController } from './controllers/quotes.controller';
import { QuotesMutationService } from './services/quotes-mutation.service';
import { QuotesService } from './services/quotes.service';

@Module({
  controllers: [QuotesController],
  providers: [QuotesService, QuotesMutationService],
})
export class QuotesModule {}
