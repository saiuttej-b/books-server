import { Genders } from '@app/core';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ default: 'John Smith' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ default: Genders.MALE })
  @IsIn(Object.values(Genders))
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ default: 'john@gmail.com' })
  @Transform(({ value }: { value?: string | null }) => value?.toLowerCase()?.trim())
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ default: 'Password@123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class VerifyRegistrationOtpDto {
  @ApiProperty({ default: '' })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ default: '' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
