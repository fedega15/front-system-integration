// Interfaces for authentication and sensitive data

export interface JwtPayload {
  id: string;
  username: string;
  role: string;
  Orgnum?: string;
  LegalName?: string;
  iat: number;
  exp: number;
}

export interface SensitiveData {
  frontSystem: {
    subscriptionKey: string;
    apiKey: string;
  };
  wooCommerce?: {
    consumerKey: string;
    consumerSecret: string;
    url: string;
  };
}
