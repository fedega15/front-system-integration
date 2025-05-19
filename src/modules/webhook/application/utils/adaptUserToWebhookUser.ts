import { User as WebhookUser } from '@/modules/webhook/application/interface/user.interface';
import { User as AuthUser } from '@/modules/auth/infrastructure/schemas/user.schema';

export function adaptUserToWebhookUser(user: AuthUser): WebhookUser {
  return {
    id: user._id.toString(),
    storeUrl: user.WooCommerceUrl,
    apiKeys: {
      frontSystem: {
        subscriptionKey: user.FsSubscriptionKey,
        apiKey: user.FsApiKey,
      },
      wooCommerce: {
        consumerKey: user.WooCommerceConsumerKey,
        consumerSecret: user.WooCommerceConsumerSecret,
        storeUrl: user.WooCommerceUrl,
      },
    },
  };
}
