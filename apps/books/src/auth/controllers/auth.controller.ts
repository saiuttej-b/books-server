import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto, RefreshAccessTokenDto } from '../dtos/auth.dto';
import { DisableJwtAuthGuard } from '../guards/books-user-auth.guard';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @DisableJwtAuthGuard()
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @DisableJwtAuthGuard()
  @Post('refresh-access-token')
  refreshAccessToken(@Body() body: RefreshAccessTokenDto) {
    return this.authService.refreshAccessToken(body);
  }

  @Post('logout')
  logout(@Body() body: RefreshAccessTokenDto) {
    return this.authService.logout(body);
  }
}
