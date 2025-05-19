import { Injectable, Logger } from '@nestjs/common';
import { WebhookService } from '@/modules/webhook/application/service/webhook.service';
import { FsStoreService } from '@/modules/front-systems/store/application/service/store.service';
import { User } from '@/modules/auth/infrastructure/schemas/user.schema';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly webhookService: WebhookService,
    private readonly storeService: FsStoreService,
  ) {}

  async handleUserOnboarding(user: User) {
    try {
      this.logger.log(`Initializing FrontSystems stores for user ${user.id}`);
      const frontSystemsStores =
        await this.storeService.syncStoresAndStocks(user);

      this.logger.log(`Setting up WooCommerce webhooks for user ${user.id}`);
      await this.webhookService.setupWooCommerceWebhooks(user);

      await this.webhookService.setupFrontSystemsWebhook(user);

      await this.performInitialSync(user, frontSystemsStores);

      return { success: true };
    } catch (error) {
      this.logger.error(`Onboarding failed for user ${user.id}:`, error);
      await this.handleOnboardingFailure(user, error);
      throw error;
    }
  }

  private async performInitialSync(user: User, frontSystemsData: any) {
    this.logger.log(`Performing initial sync for user ${user.id}`);
    // TODO: Implementar sincronización inicial de productos e inventario
  }

  private async handleOnboardingFailure(user: User, error: any) {
    this.logger.warn(`Cleaning up after failed onboarding for user ${user.id}`);

    try {
      await this.webhookService.cleanupWebhooks(user);
    } catch (cleanupError) {
      this.logger.error(
        `Failed to cleanup after onboarding failure for user ${user.id}:`,
        cleanupError,
      );
    }
  }
}
