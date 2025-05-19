import { User } from '@/modules/auth/infrastructure/schemas/user.schema';

export const validateUserCredentials = (user: User): void => {
  const hasRequiredCredentials = 
    user.FsSubscriptionKey &&
    user.FsApiKey &&
    user.Orgnum &&
    user.WooCommerceConsumerKey &&
    user.WooCommerceConsumerSecret &&
    user.WooCommerceUrl;

  if (!hasRequiredCredentials) {
    throw new Error('Credenciales incompletas');
  }
}; 