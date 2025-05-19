import { Injectable, Logger } from '@nestjs/common';
import { FrontSystemsHttpClientService } from '@/common/application/service/front-systems-client.service';
import { StoreRepository } from '../../infrastructure/persistance/store-repository';
import { FSStoreDto } from '../dto';
import { User } from '@/modules/auth/infrastructure/schemas/user.schema';

// Utility function to extract Front Systems API keys from user object
function extractFrontSystemKeys(user: any): { subscriptionKey: string; apiKey: string } | null {
  if (user.apiKeys?.frontSystem?.subscriptionKey && user.apiKeys?.frontSystem?.apiKey) {
    return {
      subscriptionKey: user.apiKeys.frontSystem.subscriptionKey,
      apiKey: user.apiKeys.frontSystem.apiKey,
    };
  }
  if (user.FsSubscriptionKey && user.FsApiKey) {
    return {
      subscriptionKey: user.FsSubscriptionKey,
      apiKey: user.FsApiKey,
    };
  }
  return null;
}

@Injectable()
export class FsStoreService {
  private readonly logger = new Logger(FsStoreService.name);

  constructor(
    private readonly frontSystemsClient: FrontSystemsHttpClientService,
    private readonly storeRepository: StoreRepository,
  ) {}

  async getStores(user: any): Promise<FSStoreDto[]> {
    this.logger.debug('Getting stores for user:', {
      id: user?._id || user?.userId || user?.id,
      FsSubscriptionKey: user?.FsSubscriptionKey,
      FsApiKey: user?.FsApiKey,
      apiKeys: user?.apiKeys,
      all: user,
    });
    const keys = extractFrontSystemKeys(user);
    if (!keys) {
      throw new Error('Front Systems API keys not found for user');
    }
    try {
      const response = await this.frontSystemsClient.get<FSStoreDto[]>(
        '/Stores',
        {
          FsSubscriptionKey: keys.subscriptionKey,
          FsApiKey: keys.apiKey,
        },
      );
      return response;
    } catch (error) {
      this.logger.error('Error getting stores:', error);
      throw error;
    }
  }

  async syncStoresAndStocks(user: User): Promise<any> {
    try {
      const stores = await this.getStores(user);
      this.logger.log('Stores and stocks synced successfully');
      return await this.storeRepository.upsertStores(stores); // Guarda o actualiza los stores en la base de datos
    } catch (error) {
      this.logger.error('Error syncing stores and stocks:', error);
    }
  }

  async getStoreByStockId(
    user: User,
    stockId: number,
  ): Promise<FSStoreDto | null> {
    try {
      const store = await this.storeRepository.findOneByStockId(stockId);

      this.logger.debug(
        `Store ${store.StoreId} for stockId ${stockId} found in DB.`,
      );
      return store;
    } catch (error) {
      this.logger.error('Error getting store by stock ID:', error);
      throw error;
    }
  }
}
