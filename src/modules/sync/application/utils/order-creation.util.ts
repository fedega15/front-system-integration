import { Logger } from '@nestjs/common';
import { WooCommerceOrderDto } from '@/modules/woocommerce/webhooks/application/dto';
import { User } from '@/modules/webhook/application/interface/user.interface';
import { FsOrderService } from '@/modules/front-systems/order/application/service/fs-order.service';
import { StoreStockAssignment } from '../interface';
import { mapWooCommerceOrderToFrontSystems } from '@/modules/woocommerce/webhooks/application/utils/mapOrderToFrontSystems';

export class OrderCreationUtil {
  private static readonly logger = new Logger(OrderCreationUtil.name);

  static prepareOrderForStore(
    woocommerceOrder: WooCommerceOrderDto,
    assignment: StoreStockAssignment,
  ) {
    const orderMapped = mapWooCommerceOrderToFrontSystems(
      woocommerceOrder,
      assignment.stockId,
      assignment.store,
      assignment.products.map((p) => ({
        productId: p.productId,
        gtin: p.gtin,
        stockQty: [],
        stockIds: [assignment.stockId],
        identity: p.identity,
      })),
    );

    // Update order lines to match assigned quantities
    orderMapped.orderLines = orderMapped.orderLines.filter((line) => {
      const product = assignment.products.find((p) => p.gtin === line.gtin);
      if (product) {
        line.quantity = product.quantity;
        return true;
      }
      return false;
    });

    return orderMapped;
  }

  static async createOrderForStore(
    assignment: StoreStockAssignment,
    orderMapped: any,
    user: User,
    fsOrderService: FsOrderService,
  ): Promise<
    StoreStockAssignment & { status: 'success' | 'error'; message?: string }
  > {
    try {
      this.logger.debug(
        `Creating order for store ${assignment.store.StoreName}`,
      );

      await fsOrderService.createOrder(
        user,
        orderMapped,
        assignment.stockId.toString(),
      );

      this.logger.debug(
        `Order created successfully for store ${assignment.store.StoreName}`,
      );
      return {
        ...assignment,
        status: 'success' as const,
        message: 'Order created successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error creating order for store ${assignment.store.StoreName}:`,
        error,
      );
      return {
        ...assignment,
        status: 'error' as const,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
