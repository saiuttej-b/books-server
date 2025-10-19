import { AppEnvType } from '@app/core';
import { AppRequestStoreService } from '@app/integrations';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';
import { UserRepository } from '../../db/repositories/user.repository';

@Injectable()
export class AuthCheckService {
  constructor(
    private readonly adminUserRepo: UserRepository,
    private readonly configService: ConfigService<AppEnvType>,
    private readonly requestStore: AppRequestStoreService,
  ) {}

  async getUserFromAccessToken(accessToken: string) {
    const { jwtSecret } = this.getAuthKeys();

    let id: string | null = null;
    let createdAt: Date | null = null;

    try {
      const payload = verify(accessToken, jwtSecret) as { id: string; createdAt: string };

      id = payload.id;
      if (payload.createdAt) createdAt = new Date(payload.createdAt);
    } catch (error) {
      console.error('Error while verifying the access token.', error);
    }

    if (!id || !createdAt) return;

    const user = await this.adminUserRepo.findById(id);
    if (!user) return;

    return user;
  }

  getCurrentUser() {
    const user = this.requestStore.getUser();
    return {
      user: { ...user, password: undefined },
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
