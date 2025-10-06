import { AppRequestStoreService } from '@app/integrations';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

const DISABLE_JWT_AUTH_GUARD = 'DISABLE_JWT_AUTH_GUARD';
export const DisableJwtAuthGuard = () => SetMetadata(DISABLE_JWT_AUTH_GUARD, true);

@Injectable()
export class BooksUserAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly requestStore: AppRequestStoreService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const methodCheck = this.reflector.get(DISABLE_JWT_AUTH_GUARD, context.getHandler());
    const classCheck = this.reflector.get(DISABLE_JWT_AUTH_GUARD, context.getClass());
    if (methodCheck || classCheck) return true;

    const user = this.requestStore.getUserOrNull();
    if (!user) throw new UnauthorizedException();
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account is not active. Please contact the administrator.',
      );
    }

    return true;
  }
}
