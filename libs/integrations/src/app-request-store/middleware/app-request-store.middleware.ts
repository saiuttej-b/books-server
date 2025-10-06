import { Injectable, NestMiddleware } from '@nestjs/common';
import { RequestStoreService } from '@saiuttej/nestjs-request-store';
import { Request, Response } from 'express';
import { AppRequestStoreService } from '../services/app-request-store.service';

/**
 * Request store middleware
 * It initializes the request store for each request and sets the express request
 */
@Injectable()
export class AppRequestStoreMiddleware implements NestMiddleware {
  /**
   * Constructor
   *
   * @param {RequestStoreService} service - Request store service
   */
  constructor(
    private readonly service: AppRequestStoreService,
    private readonly storeService: RequestStoreService,
  ) {}

  /**
   * Middleware function
   *
   * @param {Request} req - Express request
   * @param {Response} _ - Express response
   * @param {Function} next - Next function
   * @returns {Promise<void>} Promise that resolves when the middleware is done
   */
  async use(req: Request, _: Response, next: (error?: any) => void): Promise<void> {
    await this.storeService.session({
      execute: () => {
        this.service.setExpressRequest(req);
        next();
      },
    });
  }
}
