import { Injectable, Logger } from '@nestjs/common';
import { SyncOrderService } from '@/modules/sync/application/service/sync-order.service';
import { OrderSyncResult } from '@/modules/sync/application/interface';
import { WoocommerceHttpClientService } from '@/common/application/service/woocommerce-client.service';
import { webhooksToSetup } from '../utils/webhooks';
import {
  User as AuthUser,
} from '@/modules/auth/infrastructure/schemas/user.schema';
import { WebhookRepository } from '../../infrastructure/persistance/webhook-repository';
import { FrontSystemsHttpClientService } from '@/common/application/service/front-systems-client.service';
import { User as WebhookUser } from '../interface/user.interface';
import { adaptUserToWebhookUser } from '../utils/adaptUserToWebhookUser';

interface WooCommerceWebhookResponse {
  id: number;
  delivery_url: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly syncOrderService: SyncOrderService,
    private readonly wooCommerceClient: WoocommerceHttpClientService,
    private readonly webhookRepository: WebhookRepository,
    private readonly frontSystemsClient: FrontSystemsHttpClientService,
  ) {}

  async processWooCommerceWebhook(data: {
    user: AuthUser;
    topic: string;
    payload: any;
  }): Promise<OrderSyncResult> {
    const { user, topic, payload } = data;

    this.logger.debug('Processing webhook:', {
      topic,
      userId: user?._id,
      storeUrl: user?.WooCommerceUrl,
    });

    if (!user) {
      throw new Error('No user provided in webhook data');
    }

    if (!user.WooCommerceConsumerKey || !user.WooCommerceConsumerSecret) {
      throw new Error('Missing WooCommerce credentials in user data');
    }

    switch (topic) {
      case 'order.created':
        return this.syncOrderService.handleOrderCreated(payload, user);
      default:
        throw new Error(`Unhandled webhook topic: ${topic}`);
    }
  }

  async setupWooCommerceWebhooks(authUser: AuthUser) {
    const user = adaptUserToWebhookUser(authUser);
    
    this.logger.debug('Setting up webhooks for user:', {
      userId: user.id,
      storeUrl: user.storeUrl,
    });

    try {
      const configuredWebhooks = await Promise.all(
        webhooksToSetup.map(async (webhook) => {
          const response = await this.wooCommerceClient.post<WooCommerceWebhookResponse>(
            '/webhooks',
            {
              name: `Integration - ${webhook.description}`,
              topic: webhook.topic,
              delivery_url: this.generateWebhookUrl(user, webhook.topic),
            },
            this.mapUserToWooCommerceCredentials(user),
          );

          return this.webhookRepository.createWebhookConfig({
            userId: user.id.toString(),
            topic: webhook.topic,
            wooCommerceWebhookId: response.id,
            deliveryUrl: response.delivery_url,
          });
        }),
      );

      this.logger.debug('Webhooks configured successfully:', {
        userId: user.id,
        webhookCount: configuredWebhooks.length,
      });

      return configuredWebhooks;
    } catch (error) {
      this.logger.error('Failed to setup webhooks:', {
        userId: user.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async cleanupWebhooks(authUser: AuthUser) {
    const user = adaptUserToWebhookUser(authUser);
    
    this.logger.debug('Cleaning up webhooks for user:', {
      userId: user.id,
      storeUrl: user.storeUrl,
    });

    try {
      const webhooks = await this.webhookRepository.findWebhooksByUser(authUser);
      const credentials = this.mapUserToWooCommerceCredentials(user);

      await Promise.all(
        webhooks.map(async (webhook) => {
          try {
            await this.wooCommerceClient.delete(
              `/webhooks/${webhook.wooCommerceWebhookId}`,
              credentials,
            );
          } catch (e) {
            this.logger.error('Failed to delete WooCommerce webhook:', {
              webhookId: webhook.wooCommerceWebhookId,
              error: e instanceof Error ? e.message : String(e),
            });
          }
        }),
      );

      await this.webhookRepository.deleteWebhooksByUser(authUser);

      this.logger.debug('Webhooks cleaned up successfully:', {
        userId: user.id,
        webhookCount: webhooks.length,
      });
    } catch (error) {
      this.logger.error('Failed to cleanup webhooks:', {
        userId: user.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  private generateWebhookUrl(user: WebhookUser, topic: string): string {
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    return `${process.env.NGROK_URL}/webhooks/woocommerce`;
  }

  private mapUserToWooCommerceCredentials(user: WebhookUser) {
    return {
      consumerKey: user.apiKeys.wooCommerce.consumerKey,
      consumerSecret: user.apiKeys.wooCommerce.consumerSecret,
      url: user.apiKeys.wooCommerce.storeUrl,
    };
  }

  async setupFrontSystemsWebhook(authUser: AuthUser): Promise<void> {
    const user = adaptUserToWebhookUser(authUser);
    const callbackUrl = `${process.env.NGROK_URL}/webhooks/frontsystems`;
    
    this.logger.debug('Setting up FrontSystems webhook:', {
      userId: user.id,
      callbackUrl,
    });

    try {
      await this.frontSystemsClient.post('/Webhooks', user, {
        event: 'StockMovementCreated',
        url: callbackUrl,
      });

      this.logger.debug('FrontSystems webhook setup successfully:', {
        userId: user.id,
        callbackUrl,
      });
    } catch (error) {
      this.logger.error('Failed to setup FrontSystems webhook:', {
        userId: user.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
