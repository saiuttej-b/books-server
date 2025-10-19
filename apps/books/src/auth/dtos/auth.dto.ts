import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ default: 'sample@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  loginId: string;

  @ApiProperty({ default: 'Password@123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshAccessTokenDto {
  @ApiProperty({ default: 'sample-refresh-token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class GoogleAuthenticationDto {
  @ApiProperty({ default: 'Google access token' })
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
