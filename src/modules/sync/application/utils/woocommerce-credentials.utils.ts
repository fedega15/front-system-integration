import { User } from '../interface/user.interface';
import { WooCommerceCredentials } from '@/modules/woocommerce/product/application/dto/woocommerce-credentials.dto';
import { TextUtils } from './text.utils';

/**
 * Valida y obtiene las credenciales de WooCommerce del usuario
 * @param user Usuario con credenciales de WooCommerce
 * @returns Credenciales de WooCommerce validadas
 * @throws Error si las credenciales están incompletas o la URL no está configurada
 */
export function validateAndGetWooCommerceCredentials(user: User): WooCommerceCredentials {
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