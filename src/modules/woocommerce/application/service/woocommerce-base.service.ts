import { Injectable, Logger } from '@nestjs/common';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

export interface WooCommerceCredentials {
  consumerKey: string;
  consumerSecret: string;
  url: string;
}

@Injectable()
export class WooCommerceBaseService {
  protected readonly logger = new Logger(this.constructor.name);
  private clientCache: Map<string, WooCommerceRestApi> = new Map();

  protected formatWooCommerceUrl(url: string): string {
    if (!url) return '';
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }

  protected getWooCommerceClient(credentials: WooCommerceCredentials): WooCommerceRestApi {
    const cacheKey = `${credentials.consumerKey}-${credentials.consumerSecret}-${credentials.url}`;
    
    if (this.clientCache.has(cacheKey)) {
      return this.clientCache.get(cacheKey);
    }

    if (!credentials.url) {
      this.logger.error('URL de WooCommerce no proporcionada');
      throw new Error('URL de WooCommerce es requerida');
    }

    const formattedUrl = this.formatWooCommerceUrl(credentials.url);

    const client = new WooCommerceRestApi({
      url: formattedUrl.replace('/wp-json/wc/v3', ''), // La biblioteca agrega el path automáticamente
      consumerKey: credentials.consumerKey,
      consumerSecret: credentials.consumerSecret,
      version: 'wc/v3',
      queryStringAuth: true,
      axiosConfig: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    });

    this.clientCache.set(cacheKey, client);
    return client;
  }

  protected validateCredentials(credentials: WooCommerceCredentials): void {
    if (!credentials?.consumerKey || !credentials?.consumerSecret || !credentials?.url) {
      this.logger.error('Credenciales de WooCommerce incompletas:', {
        hasConsumerKey: !!credentials?.consumerKey,
        hasConsumerSecret: !!credentials?.consumerSecret,
        hasUrl: !!credentials?.url
      });
      throw new Error('Credenciales de WooCommerce incompletas');
    }

    // Formatear la URL antes de validar
    credentials.url = this.formatWooCommerceUrl(credentials.url);
  }
} 