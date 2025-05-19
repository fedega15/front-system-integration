export interface CurrentUser {
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