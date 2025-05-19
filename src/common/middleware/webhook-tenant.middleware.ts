// src/common/middleware/webhook-tenant.middleware.ts
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthRepository } from '@/modules/auth/infrastructure/persistance/auth.repository';
import { adaptUserToWebhookUser } from '@/modules/webhook/application/utils/adaptUserToWebhookUser';

@Injectable()
export class WebhookTenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(WebhookTenantMiddleware.name);

  constructor(private readonly authRepository: AuthRepository) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const storeUrl = req.headers['x-wc-webhook-source'] as string;
      this.logger.debug(`Incoming webhook from: ${storeUrl}`);

      const topic = req.headers['x-wc-webhook-topic'] as string;
      this.logger.debug(`Webhook topic: ${topic}`);

      if (!storeUrl) {
        this.logger.warn('No store URL found in headers');
        return res.status(400).json({ error: 'Missing store URL in headers' });
      }

      const user = await this.authRepository.findByStoreUrl(storeUrl);
      if (!user) {
        this.logger.warn(`No user found for store URL: ${storeUrl}`);
        return res.status(404).json({ error: 'Store not found' });
      }

      this.logger.debug(`Tenant identified: ${user._id}`);
      
      // Adapt the user to the webhook format and set it in the request
      const webhookUser = adaptUserToWebhookUser(user);
      req['user'] = webhookUser;

      next();
    } catch (error: any) {
      this.logger.error(`Error in WebhookTenantMiddleware: ${error?.message || 'Unknown error'}`);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  private normalizeUrl(url: string): string {
    return new URL(url).origin.toLowerCase();
  }

  private verifyWebhookSignature(
    signature: string,
    payload: any,
    secret: string,
  ): boolean {
    // Implementar lógica de verificación de firma
    return true; // Temporal - implementar según docs de WooCommerce
  }
}
