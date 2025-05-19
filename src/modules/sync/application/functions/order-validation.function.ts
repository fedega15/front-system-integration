import { WooCommerceOrderDto } from '@/modules/woocommerce/webhooks/application/dto';
import { FSStoreDto } from '@/modules/front-systems/store/application/dto';
import { OrderValidator } from '../utils/order-validator.util';
import { User } from '@/modules/auth/infrastructure/schemas/user.schema';

export const validateOrderAndCredentials = async (
  existingOrder: any,
  payload: WooCommerceOrderDto,
  user: User,
): Promise<void> => {
  OrderValidator.validateOrderExists(existingOrder, payload.id);
  OrderValidator.hasValidWooCommerceCredentials(user);
};

export const validateWebshopStore = (webshopStore: FSStoreDto): void => {
  OrderValidator.validateWebshopStore(webshopStore);
};
