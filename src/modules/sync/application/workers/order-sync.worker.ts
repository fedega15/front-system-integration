import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { WebhookService } from '@/modules/webhook/application/service/webhook.service';
import { User } from '@/modules/auth/infrastructure/schemas/user.schema';

@Processor('order-sync', { concurrency: 10 })
// @Processor('order-sync', { limiter: { max: 50, duration: 300000 } })
export class OrderSyncConsumer extends WorkerHost {
  private readonly logger = new Logger(OrderSyncConsumer.name);

  constructor(private readonly webhookService: WebhookService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    try {
      const { user, topic, payload } = job.data;

      this.logger.debug('Processing job:', {
        jobId: job.id,
        topic,
        userId: user?._id,
        storeUrl: user?.WooCommerceUrl,
      });

      if (!user) {
        throw new Error('No user provided in job data');
      }

      if (!user.WooCommerceConsumerKey || !user.WooCommerceConsumerSecret) {
        throw new Error('Missing WooCommerce credentials in user data');
      }

      const result = await this.webhookService.processWooCommerceWebhook({
        user,
        topic,
        payload,
      });

      this.logger.debug('Job completed successfully:', {
        jobId: job.id,
        result,
      });

      return result;
    } catch (error) {
      this.logger.error('Error processing job:', {
        jobId: job.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
