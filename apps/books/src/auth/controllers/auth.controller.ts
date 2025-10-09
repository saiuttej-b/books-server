import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto, RefreshAccessTokenDto } from '../dtos/auth.dto';
import { RegisterDto, VerifyRegistrationOtpDto } from '../dtos/register.dto';
import { DisableJwtAuthGuard } from '../guards/books-user-auth.guard';
import { AuthRegistrationService } from '../services/auth-registration.service';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly registerService: AuthRegistrationService,
  ) {}

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

  @DisableJwtAuthGuard()
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.registerService.register(body);
  }

  @DisableJwtAuthGuard()
  @Post('verify-registration-otp')
  verifyRegistrationOtp(@Body() body: VerifyRegistrationOtpDto) {
    return this.registerService.verifyRegistrationOtp(body);
  }
}
