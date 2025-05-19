import { registerAs } from '@nestjs/config';

export default registerAs('frontsystems', () => ({
  apiUrl: process.env.FRONT_SYSTEMS_API_URL,
  subscription_key: process.env.FRONT_SYSTEMS_SUBSCRIPTION_KEY,
  api_key: process.env.FRONT_SYSTEMS_API_KEY,
})); 