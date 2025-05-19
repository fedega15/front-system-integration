export interface FrontSystemCredentials {
  subscriptionKey: string;
  apiKey: string;
}

export interface WooCommerceCredentials {
  consumerKey: string;
  consumerSecret: string;
  url: string;
}

export interface ApiKeys {
  frontSystem: FrontSystemCredentials;
  wooCommerce: WooCommerceCredentials;
} 