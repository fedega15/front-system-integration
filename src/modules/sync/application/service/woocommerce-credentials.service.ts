import { Injectable, Logger } from '@nestjs/common';
import { User } from '../interface/user.interface';
import { WooCommerceCredentials } from '@/modules/woocommerce/product/application/dto/woocommerce-credentials.dto';
import { TextUtils } from '../utils/text.utils';
import { AuthRepository } from '@/modules/auth/infrastructure/persistance/auth.repository';
import { WooCommerceUrlResponseDto } from '../dto/woocommerce-url-response.dto';

@Injectable()
export class WooCommerceCredentialsService {
  private readonly logger = new Logger(WooCommerceCredentialsService.name);

  constructor(private readonly authRepository: AuthRepository) {}

  validateAndGetCredentials(user: User): WooCommerceCredentials {
    const { wooCommerce } = user.apiKeys;
    if (!wooCommerce?.consumerKey || !wooCommerce?.consumerSecret) {
      throw new Error('Credenciales de WooCommerce incompletas');
    }

    const rawUrl = wooCommerce?.url || process.env.WOOCOMMERCE_API_URL;
    if (!rawUrl) {
      throw new Error('URL de WooCommerce no configurada');
    }

    return {
      consumerKey: wooCommerce.consumerKey,
      consumerSecret: wooCommerce.consumerSecret,
      url: TextUtils.formatWooCommerceUrl(rawUrl)
    };
  }

  async updateWooCommerceUrl(userId: string, url: string): Promise<WooCommerceUrlResponseDto> {
    try {
      const formattedUrl = TextUtils.formatWooCommerceUrl(url);

      await this.authRepository.findByIdAndUpdate(userId, {
        WooCommerceUrl: formattedUrl,
      });

      return { message: 'URL de WooCommerce actualizada correctamente' };
    } catch (error) {
      this.logger.error('Error updating WooCommerce URL:', error);
      throw error;
    }
  }
} 