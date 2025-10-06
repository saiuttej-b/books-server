import { User } from '@app/core';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RequestStoreService } from '@saiuttej/nestjs-request-store';
import { Request } from 'express';

/**
 * Symbol for the express request
 */
const EXPRESS_REQUEST = Symbol.for('EXPRESS_REQUEST');

/**
 * Symbol for the current user
 */
const CURRENT_USER = Symbol.for('CURRENT_USER');

@Injectable()
export class AppRequestStoreService {
  constructor(private readonly service: RequestStoreService) {}

  setExpressRequest(req: Request): void {
    this.service.setValue(EXPRESS_REQUEST.toString(), req);
  }

  getExpressRequest(): Request | undefined {
    return this.service.getValue<Request>(EXPRESS_REQUEST.toString());
  }

  setUser(data: User): void {
    this.service.setValue(CURRENT_USER.toString(), data);
  }

  getUserOrNull(): User | null {
    return this.service.getValue(CURRENT_USER.toString()) || null;
  }

  getUser(): User {
    const user = this.getUserOrNull();
    if (!user) {
      throw new UnauthorizedException('Unable to get current user details');
    }
    return user;
  }

  getUserId(): string {
    const user = this.getUser();
    if (!user) {
      throw new UnauthorizedException('Unable to get current user ID');
    }
    return user.id;
  }
}
