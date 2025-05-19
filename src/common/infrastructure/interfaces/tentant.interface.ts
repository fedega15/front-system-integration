export interface TenantApiKeys {
  frontSystem: {
    subscriptionKey: string;
    apiKey: string;
  };
  wooCommerce: {
    consumerKey: string;
    consumerSecret: string;
    storeUrl: string;
  };
}

export interface Tenant {
  id: string;
  storeUrl: string;
  apiKeys: TenantApiKeys;
}
