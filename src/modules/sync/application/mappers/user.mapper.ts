import { User } from '@/modules/auth/infrastructure/schemas/user.schema';
import { FrontSystemCredentials, WooCommerceCredentials, ApiKeys } from '../interface/credentials.interface';
import { MappedUser } from '../interface/user.interface';

//map creds
const mapFrontSystemCredentials = (user: User): FrontSystemCredentials => ({
  subscriptionKey: user.FsSubscriptionKey,
  apiKey: user.FsApiKey,
});

const mapWooCommerceCredentials = (user: User): WooCommerceCredentials => ({
  consumerKey: user.WooCommerceConsumerKey,
  consumerSecret: user.WooCommerceConsumerSecret,
  url: user.WooCommerceUrl,
});

// combina los mapeos
const mapApiKeys = (user: User): ApiKeys => ({
  frontSystem: mapFrontSystemCredentials(user),
  wooCommerce: mapWooCommerceCredentials(user),
});

export const mapUserForSync = (user: User): MappedUser => ({
  userId: user._id.toString(),
  username: user.username,
  role: user.role,
  FsSubscriptionKey: user.FsSubscriptionKey,
  FsApiKey: user.FsApiKey,
  Orgnum: user.Orgnum,
  apiKeys: mapApiKeys(user),
});

interface CurrentUser {
  userId: string;
  username: string;
  role: string;
  Orgnum: string;
  apiKeys: {
    frontSystem: {
      subscriptionKey: string;
      apiKey: string;
    };
    wooCommerce: {
      consumerKey: string;
      consumerSecret: string;
      url: string;
    };
  };
}

export const mapCurrentUser = (user: CurrentUser): MappedUser => ({
  userId: user.userId,
  username: user.username,
  role: user.role,
  FsSubscriptionKey: user.apiKeys.frontSystem.subscriptionKey,
  FsApiKey: user.apiKeys.frontSystem.apiKey,
  Orgnum: user.Orgnum,
  apiKeys: {
    frontSystem: {
      subscriptionKey: user.apiKeys.frontSystem.subscriptionKey,
      apiKey: user.apiKeys.frontSystem.apiKey,
    },
    wooCommerce: {
      consumerKey: user.apiKeys.wooCommerce.consumerKey,
      consumerSecret: user.apiKeys.wooCommerce.consumerSecret,
      url: user.apiKeys.wooCommerce.url,
    },
  },
}); 