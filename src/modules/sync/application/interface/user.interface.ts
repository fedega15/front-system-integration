import { ApiKeys } from './credentials.interface';

export interface MappedUser {
  userId: string;
  username: string;
  role: string;
  FsSubscriptionKey: string;
  FsApiKey: string;
  Orgnum: string;
  apiKeys: ApiKeys;
}

export interface User {
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