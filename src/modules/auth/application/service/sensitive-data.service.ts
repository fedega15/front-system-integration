import { Injectable, Logger } from '@nestjs/common';
import { AuthRepository } from '../../infrastructure/persistance/auth.repository';
import NodeCache from 'node-cache';
import { SensitiveData } from '../types/auth-interfaces';

@Injectable()
export class SensitiveDataService {
  private readonly logger = new Logger(SensitiveDataService.name);
  private readonly cache: NodeCache;
  private readonly CACHE_TTL = 300;

  constructor(private readonly authRepository: AuthRepository) {
    this.cache = new NodeCache({ stdTTL: this.CACHE_TTL });
  }

  async getSensitiveData(userId: string): Promise<SensitiveData> {
    const cacheKey = `sensitive_data_${userId}`;
    
    // primero busca en cache
    const cachedData = this.cache.get<SensitiveData>(cacheKey);
    if (cachedData) {
      this.logger.debug('Retrieved sensitive data from cache');
      return cachedData;
    }

      // si no esta en cache voy a db
    const user = await this.authRepository.findById(userId);
    this.logger.debug('Raw user from MongoDB:', user);
    if (!user) {
      throw new Error('User not found');
    }

    this.logger.debug('Retrieved user from database:', {
      userId: user._id,
      username: user.username,
      hasWooCommerceConsumerKey: !!user.WooCommerceConsumerKey,
      hasWooCommerceConsumerSecret: !!user.WooCommerceConsumerSecret,
      hasWooCommerceUrl: !!user.WooCommerceUrl,
      WooCommerceConsumerKey: user.WooCommerceConsumerKey,
      WooCommerceConsumerSecret: user.WooCommerceConsumerSecret,
      WooCommerceUrl: user.WooCommerceUrl
    });

    const sensitiveData: SensitiveData = {
      frontSystem: {
        subscriptionKey: user.FsSubscriptionKey || '',
        apiKey: user.FsApiKey || ''
      },
      wooCommerce: user.WooCommerceConsumerKey && user.WooCommerceConsumerSecret && user.WooCommerceUrl ? {
        consumerKey: user.WooCommerceConsumerKey,
        consumerSecret: user.WooCommerceConsumerSecret,
        url: user.WooCommerceUrl
      } : undefined
    };

    this.logger.debug('Created sensitive data object:', {
      hasFrontSystem: !!sensitiveData.frontSystem,
      hasWooCommerce: !!sensitiveData.wooCommerce,
      wooCommerceData: sensitiveData.wooCommerce,
      userWooCommerceData: {
        consumerKey: user.WooCommerceConsumerKey,
        consumerSecret: user.WooCommerceConsumerSecret,
        url: user.WooCommerceUrl
      }
    });

    //aca guardo en cache
    this.cache.set(cacheKey, sensitiveData);
    this.logger.debug('Stored sensitive data in cache');

    return sensitiveData;
  }

  clearCache(userId: string) {
    const cacheKey = `sensitive_data_${userId}`;
    this.cache.del(cacheKey);
    this.logger.debug('Cleared sensitive data cache');
  }
} 