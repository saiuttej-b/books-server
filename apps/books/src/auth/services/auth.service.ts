import { AppEnvType, AuthTokenTypes } from '@app/core';
import { AuthTokensService, DbService } from '@app/infra';
import { AppRequestStoreService } from '@app/integrations';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from '@saiuttej/nestjs-encryptions';
import { sign } from 'jsonwebtoken';
import { UserRepository } from '../../db/repositories/user.repository';
import { LoginDto, RefreshAccessTokenDto } from '../dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly configService: ConfigService<AppEnvType>,
    private readonly authTokenService: AuthTokensService,
    private readonly requestStore: AppRequestStoreService,
    private readonly encryptionService: EncryptionService,
    private readonly dbService: DbService,
  ) {}

  async login(reqBody: LoginDto) {
    const user = await this.userRepo.findByLoginId(reqBody.loginId);
    if (!user) {
      throw new NotFoundException('No user found with this login Id');
    }
    if (!user.isActive) {
      throw new NotFoundException('Your account is currently inactive. Please contact support.');
    }

    if (!user.password) {
      throw new NotFoundException('No password is set to your account. Please contact support.');
    }

    const isValidPassword = await this.encryptionService.compareHash(
      reqBody.password,
      user.password,
    );
    if (!isValidPassword) {
      throw new NotFoundException('Invalid password');
    }

    return await this.generateToken(user.id);
  }

  async refreshAccessToken(reqBody: RefreshAccessTokenDto) {
    const authToken = await this.authTokenService.findTokenById(reqBody.refreshToken);
    if (!authToken) {
      throw new NotFoundException({
        message: 'Invalid refresh token',
        invalidRefreshToken: true,
      });
    }
    if (new Date(authToken.expiresAt) < new Date()) {
      throw new BadRequestException({
        message: 'Refresh token has expired',
        invalidRefreshToken: true,
      });
    }
    if (authToken.tokenType !== AuthTokenTypes.REFRESH_TOKEN) {
      throw new BadRequestException({
        message: 'Invalid token type',
        invalidRefreshToken: true,
      });
    }
    if (!authToken.userId) {
      throw new NotFoundException({
        message: 'Unable to find user details',
        invalidRefreshToken: true,
      });
    }

    const user = await this.userRepo.findById(authToken.userId);
    if (!user) {
      throw new NotFoundException({
        message: 'Unable to find user details',
        invalidRefreshToken: true,
      });
    }
    if (!user.isActive) {
      throw new NotFoundException({
        message: 'Your account is currently inactive. Please contact support.',
        invalidRefreshToken: true,
      });
    }

    const result = await this.dbService.transaction({
      execute: async () => {
        const newToken = await this.generateToken(user.id);
        await this.authTokenService.removeToken(authToken.id);
        return newToken;
      },
    });
    return result;
  }

  async logout(reqBody: RefreshAccessTokenDto) {
    const authToken = await this.authTokenService.findTokenById(reqBody.refreshToken);
    if (!authToken) return;

    const user = this.requestStore.getUserOrNull();
    if (!user) {
      throw new NotFoundException('Unable to find current user details');
    }
    if (user.id !== authToken.userId) {
      throw new NotFoundException('Invalid user logout request');
    }

    await this.authTokenService.removeToken(authToken.id);
  }

  private async generateToken(id: string) {
    const payload = { id, createdAt: new Date().toISOString() };

    const { jwtSecret } = this.getAuthKeys();

    const token = sign(payload, jwtSecret, { expiresIn: '1h' });
    const authToken = await this.authTokenService.createToken({
      tokenType: AuthTokenTypes.REFRESH_TOKEN,
      expiresAt: this.authTokenService.getRefreshTokenExpirationTime(),
      userId: id,
    });

    return {
      accessToken: token,
      refreshToken: authToken.id,
      expiresAt: authToken.expiresAt,
    };
  }

  private getAuthKeys() {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in the environment variables.');
      throw new UnprocessableEntityException(
        'Unable to process your request. Please try again later.',
      );
    }

    return { jwtSecret };
  }
}
