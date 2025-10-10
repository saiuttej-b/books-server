import { Module } from '@nestjs/common';
import { ClientsController } from './controllers/clients.controller';
import { ClientsMutationService } from './services/clients-mutation.service';
import { ClientsService } from './services/clients.service';

@Module({
  controllers: [ClientsController],
  providers: [ClientsMutationService, ClientsService],
})
export class ClientsModule {}
