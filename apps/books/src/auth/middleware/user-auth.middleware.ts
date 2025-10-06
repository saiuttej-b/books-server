import { AppRequestStoreService } from '@app/integrations';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthCheckService } from '../services/auth-check.service';

const authEnabledRoutes = ['/auth/current-user', '/auth/logout'];

@Injectable()
export class UserAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly service: AuthCheckService,
    private readonly requestStore: AppRequestStoreService,
  ) {}

  async use(req: Request, _: Response, next: (error?: any) => void) {
    let route = req.originalUrl.split('?')[0];
    if (route.startsWith('/api')) route = route.slice(4);
    if (route.startsWith('/auth') && !authEnabledRoutes.includes(route)) return next();

    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const accessToken = authHeader.split(' ')[1];
    if (accessToken) {
      const user = await this.service.getUserFromAccessToken(accessToken);
      if (user) this.requestStore.setUser(user);
    }

    next();
  }
}
