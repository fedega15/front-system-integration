// src/modules/webhooks/webhooks.controller.ts
import { Controller, Post, Req, Res, Body, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { AuthRepository } from '@/modules/auth/infrastructure/persistance/auth.repository';
import { User as AuthUser } from '@/modules/auth/infrastructure/schemas/user.schema';
import { User as WebhookUser } from '../application/interface/user.interface';
import { SensitiveDataService } from '@/modules/auth/application/service/sensitive-data.service';
import { StockMovementRepository } from '@/modules/front-systems/stock/infrastructure/persistance/stock-movement.repository';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    @InjectQueue('order-sync') private readonly orderSyncQueue: Queue,
    private readonly authRepository: AuthRepository,
    private readonly sensitiveDataService: SensitiveDataService,
    private readonly stockMovementRepository: StockMovementRepository,
  ) {}

  @Post('/woocommerce')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const webhookUser = req['user'] as WebhookUser;
      const topic = req.headers['x-wc-webhook-topic'] as string;
      const payload = req.body;

      this.logger.debug('Received webhook:', {
        topic,
        userId: webhookUser?.id,
        storeUrl: webhookUser?.storeUrl,
      });

      if (!webhookUser) {
        this.logger.error('No user found in request');
        return res.status(403).json({ error: 'User not identified' });
      }

      if (!webhookUser.apiKeys?.wooCommerce?.consumerKey || !webhookUser.apiKeys?.wooCommerce?.consumerSecret) {
        this.logger.error('Missing WooCommerce credentials for user:', webhookUser.id);
        return res.status(403).json({ error: 'Missing WooCommerce credentials' });
      }

      // Get the original AuthUser from the database
      const authUser = await this.authRepository.findById(webhookUser.id);
      if (!authUser) {
        this.logger.error('No auth user found for webhook user:', webhookUser.id);
        return res.status(404).json({ error: 'User not found' });
      }

      // Enrich with sensitive data
      const sensitiveData = await this.sensitiveDataService.getSensitiveData(authUser._id.toString());
      authUser.FsSubscriptionKey = sensitiveData.frontSystem.subscriptionKey;
      authUser.FsApiKey = sensitiveData.frontSystem.apiKey;
      if (sensitiveData.wooCommerce) {
        authUser.WooCommerceConsumerKey = sensitiveData.wooCommerce.consumerKey;
        authUser.WooCommerceConsumerSecret = sensitiveData.wooCommerce.consumerSecret;
        authUser.WooCommerceUrl = sensitiveData.wooCommerce.url;
      }

      await this.orderSyncQueue.add('order-sync', {
        user: authUser,
        topic,
        payload,
      });

      res.status(200).json({ status: 'success' });
    } catch (error) {
      this.logger.error('Error processing webhook:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Post('/frontsystems')
  async handleFrontSystemsSaleCreated(
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      this.logger.debug('Received FrontSystems webhook:', {
        payload: JSON.stringify(payload),
      });

      // Validar campos requeridos antes de guardar
      const requiredFields = [
        'movementId', 'type', 'sku', 'gtin', 'quantity', 'stockLevel',
        'reservedLevel', 'availableLevel', 'stockId',
        'createdById', 'createdDateTime'
      ];
      const missingFields = requiredFields.filter(field => !(field in payload));
      if (missingFields.length > 0) {
        this.logger.error('Missing required fields in FrontSystems webhook payload:', missingFields);
        return res.status(400).json({
          status: 'error',
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Guardar el movimiento en la base de datos
      await this.stockMovementRepository.create(payload);

      res.status(200).json({ received: true });
    } catch (error) {
      this.logger.error('Error processing FrontSystems webhook:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
