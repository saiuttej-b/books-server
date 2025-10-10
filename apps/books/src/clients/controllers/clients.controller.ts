import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ClientPostDto, GetClientsDto } from '../dtos/clients.dto';
import { ClientsMutationService } from '../services/clients-mutation.service';
import { ClientsService } from '../services/clients.service';

@Controller('clients')
export class ClientsController {
  constructor(
    private readonly service: ClientsService,
    private readonly mutationService: ClientsMutationService,
  ) {}

  @Post()
  addClient(@Body() body: ClientPostDto) {
    return this.mutationService.addClient(body);
  }

  @Put(':id')
  updateClient(@Body() body: ClientPostDto, @Param('id') id: string) {
    return this.mutationService.updateClient(body, id);
  }

  @Get()
  getClients(@Query() query: GetClientsDto) {
    return this.service.getClients(query);
  }

  @Get(':id')
  getClientDetails(@Param('id') id: string) {
    return this.service.getClientDetails(id);
  }
}
