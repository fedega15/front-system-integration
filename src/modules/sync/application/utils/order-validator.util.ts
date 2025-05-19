import { User } from '@/modules/auth/infrastructure/schemas/user.schema';
import { BadRequestException } from '@nestjs/common';

export class OrderValidator {
  static hasValidWooCommerceCredentials(user: User): boolean {
    return !!(
      user.WooCommerceConsumerKey &&
      user.WooCommerceConsumerSecret &&
      user.WooCommerceUrl
    );
  }

  static validateOrderExists(existingOrder: any, orderId: number): void {
    if (existingOrder) {
      throw new BadRequestException(
        `Order with ID ${orderId} already exists. Not processing duplicate.`,
      );
    }
  }

  static validateWebshopStore(webshopStore: any): void {
    if (!webshopStore) {
      throw new BadRequestException('No Webshop store found in Front Systems');
    }
  }
}
