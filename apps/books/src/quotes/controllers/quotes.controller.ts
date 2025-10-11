import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { QuotePostDto } from '../dtos/quote-mutations.dto';
import { QuotesGetDto } from '../dtos/quote.dto';
import { QuotesMutationService } from '../services/quotes-mutation.service';
import { QuotesService } from '../services/quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(
    private readonly mutationService: QuotesMutationService,
    private readonly service: QuotesService,
  ) {}

  @Post()
  addQuote(@Body() body: QuotePostDto) {
    return this.mutationService.addQuote(body);
  }

  @Put(':id')
  updateQuote(@Body() body: QuotePostDto, @Param('id') id: string) {
    return this.mutationService.updateQuote(body, id);
  }

  @Get()
  getQuotes(@Query() query: QuotesGetDto) {
    return this.service.getQuotes(query);
  }

  @Get(':id')
  getQuoteDetails(@Param('id') id: string) {
    return this.service.getQuoteDetails(id);
  }
}
