import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DisableJwtAuthGuard } from './auth/guards/books-user-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @DisableJwtAuthGuard()
  @Get()
  getRoot() {
    return this.appService.getRoot();
  }
}
