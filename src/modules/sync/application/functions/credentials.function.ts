import { User } from '@/modules/auth/infrastructure/schemas/user.schema';
import { WooCommerceCredentials } from '@/modules/woocommerce/application/service/woocommerce-base.service';

export const getWooCommerceCredentials = (
  user: User,
): WooCommerceCredentials => {
  return {
    consumerKey: user.WooCommerceConsumerKey,
    consumerSecret: user.WooCommerceConsumerSecret,
    url: user.WooCommerceUrl,
  };
};
