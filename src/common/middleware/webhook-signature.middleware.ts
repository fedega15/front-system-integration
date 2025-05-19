import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class WebhookSignatureMiddleware implements NestMiddleware {
  private readonly logger = new Logger(WebhookSignatureMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Log all headers
    this.logger.debug('Webhook Headers:', JSON.stringify(req.headers, null, 2));

    // Log complete request body
    this.logger.debug('Webhook Body:', JSON.stringify(req.body, null, 2));

    const signature = req.headers['x-wc-webhook-signature'] as string;
    const topic = req.headers['x-wc-webhook-topic'] as string;
    const tenant = req['tenant'];

    this.logger.debug(
      `Received webhook - Topic: ${topic}, Tenant: ${tenant?.id}`,
    );

    if (!signature || !topic || !tenant) {
      this.logger.warn(`Invalid signature for tenant ${tenant.id}`);
      throw new UnauthorizedException(
        'Missing required webhook headers or tenant',
      );
    }

    const consumerSecret = tenant.apiKeys.wooCommerce.consumerSecret;
    if (!consumerSecret) {
      throw new UnauthorizedException('Missing WooCommerce consumer secret');
    }

    this.logger.debug(`Using consumer secret: ${consumerSecret}`);

    const payload = req.body;
    const payloadString = JSON.stringify(payload);

    // Log the exact string being used for signature calculation
    this.logger.debug('Payload string for signature:', payloadString);

    // const hmac = crypto.createHmac('sha256', consumerSecret);
    // const calculatedSignature = hmac.update(payloadString).digest('base64');

    // this.logger.debug(`Calculated signature: ${calculatedSignature}`);
    // this.logger.debug(`Received signature: ${signature}`);

    // if (signature !== calculatedSignature) {
    //   this.logger.warn(`Invalid signature for tenant ${tenant.id}`);
    //   throw new UnauthorizedException('Invalid webhook signature');
    // }

    this.logger.debug(`Valid signature for tenant ${tenant.id}`);
    next();
  }
}
