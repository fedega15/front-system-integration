import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/modules/auth/infrastructure/schemas/user.schema';
import { WebhookConfig } from '../schemas/webhook-config.schema';

interface CreateWebhookConfigDto {
  userId: string;
  topic: string;
  wooCommerceWebhookId: number;
  deliveryUrl: string;
}

@Injectable()
export class WebhookRepository {
  private readonly logger = new Logger(WebhookRepository.name);

  constructor(
    @InjectModel(WebhookConfig.name)
    private webhookConfigModel: Model<WebhookConfig>,
  ) {}

  async createWebhookConfig(
    config: CreateWebhookConfigDto,
  ): Promise<WebhookConfig> {
    try {
      const webhookConfig = new this.webhookConfigModel(config);
      return webhookConfig.save();
    } catch (error) {
      this.logger.error('Error creating webhook config:', error);
      throw error;
    }
  }

  async findWebhooksByUser(user: User): Promise<WebhookConfig[]> {
    try {
      return this.webhookConfigModel.find({ userId: user._id.toString() }).exec();
    } catch (error) {
      this.logger.error('Error finding webhooks by user:', error);
      throw error;
    }
  }

  async deleteWebhooksByUser(user: User): Promise<void> {
    try {
      await this.webhookConfigModel.deleteMany({ userId: user._id.toString() }).exec();
    } catch (error) {
      this.logger.error('Error deleting webhooks by user:', error);
      throw error;
    }
  }
}
