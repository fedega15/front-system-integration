export interface User {
  id: string;
  storeUrl: string;
  apiKeys: {
    frontSystem: {
      subscriptionKey: string;
      apiKey: string;
    };
    wooCommerce: {
      consumerKey: string;
      consumerSecret: string;
      storeUrl: string;
    };
  };
}
