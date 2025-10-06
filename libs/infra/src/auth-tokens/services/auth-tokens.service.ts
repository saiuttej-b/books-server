import { AuthTokenTypes } from '@app/core';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthTokenRepository } from '../../db';

const defaultExpirationTime = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthTokensService {
  constructor(
    private readonly authTokenRepo: AuthTokenRepository,
    private readonly configService: ConfigService,
  ) {}

  getRefreshTokenExpirationTime() {
    const expirationTime = this.configService.get<string>('JWT_EXPIRATION_TIME');
    const parsedTime = this.parseExpirationTime(expirationTime);

    const value = new Date();
    value.setTime(value.getTime() + parsedTime);
    return value;
  }

  private parseExpirationTime(expirationTime?: string) {
    if (!expirationTime) return defaultExpirationTime;

    const timeUnit = expirationTime.slice(-1);
    const timeValue = Number(expirationTime.slice(0, -1));
    if (isNaN(timeValue)) {
      console.error(`Invalid expiration time format: ${expirationTime}, using default.`);
      return defaultExpirationTime;
    }
    if (timeValue <= 0) {
      console.error(`Expiration time must be greater than 0: ${expirationTime}, using default.`);
      return defaultExpirationTime;
    }

    switch (timeUnit) {
      case 'd':
        return timeValue * 24 * 60 * 60 * 1000;
      case 'h':
        return timeValue * 60 * 60 * 1000;
      case 'm':
        return timeValue * 60 * 1000;
      case 's':
        return timeValue * 1000;
      default:
        console.error(`Invalid expiration time unit: ${timeUnit}, using default.`);
        return defaultExpirationTime;
    }
  }

  async createToken(props: {
    tokenType: string;
    expiresAt: Date;
    userId?: string;
    metadata?: Record<string, unknown>;
  }) {
    if (!AuthTokenTypes[props.tokenType]) {
      throw new BadRequestException('Invalid token type.');
    }

    if (props.expiresAt <= new Date()) {
      throw new BadRequestException('Expiration date must be in the future.');
    }

    if (props.tokenType === AuthTokenTypes.REFRESH_TOKEN) {
      if (!props.userId) {
        throw new BadRequestException('User ID is required for refresh tokens.');
      }
    }

    return this.authTokenRepo.create({
      tokenType: props.tokenType,
      expiresAt: props.expiresAt.toISOString(),
      metadata: props.metadata,
      userId: props.userId,
    });
  }

  async findTokenById(id: string) {
    return this.authTokenRepo.findById(id);
  }

  async removeToken(id: string) {
    await this.authTokenRepo.deleteById(id);
  }
}
