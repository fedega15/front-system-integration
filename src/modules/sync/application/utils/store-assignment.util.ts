import { Logger } from '@nestjs/common';
import { FSStoreDto } from '@/modules/front-systems/store/application/dto';
import { ProductStockInfo, StoreStockAssignment } from '../interface';
import { WooCommerceOrderDto } from '@/modules/woocommerce/webhooks/application/dto';
import { User } from '@/modules/webhook/application/interface/user.interface';
import { FsOrderService } from '@/modules/front-systems/order/application/service/fs-order.service';
import { ProductAssignmentUtil } from './product-assignment.util';
import { OrderCreationUtil } from './order-creation.util';

export class StoreAssignmentUtil {
  private static readonly logger = new Logger(StoreAssignmentUtil.name);

  static async calculateStoreAssignments(
    products: ProductStockInfo[],
    storesByStockId: Map<number, FSStoreDto>,
  ): Promise<StoreStockAssignment[]> {
    this.logger.debug('Starting store assignment calculation');
    const assignments: StoreStockAssignment[] = [];
    const remainingProducts = [...products];

    // First try to find a store that can fulfill all products
    const singleStoreAssignment = ProductAssignmentUtil.findStoreForAllProducts(
      products,
      storesByStockId,
    );

    if (singleStoreAssignment) {
      return [singleStoreAssignment];
    }

    this.logger.debug(
      'No single store can fulfill all products, starting distribution',
    );

    // If no store can fulfill all, distribute products among stores
    while (remainingProducts.length > 0) {
      const product = remainingProducts[0];
      let remainingQuantity = product.requiredQuantity;
      this.logger.debug(
        `Processing product ${product.productId}, required quantity: ${remainingQuantity}`,
      );

      const availableStores = ProductAssignmentUtil.findAvailableStores(
        product,
        storesByStockId,
      );

      this.logger.debug(
        `Found ${availableStores.length} stores with available stock`,
      );

      for (const { stockId, store, availableQty } of availableStores) {
        if (remainingQuantity <= 0) break;

        const quantityToAssign = Math.min(availableQty, remainingQuantity);
        remainingQuantity -= quantityToAssign;

        this.logger.debug(
          `Assigning ${quantityToAssign} units to store ${store.StoreName}`,
        );

        // Add or update assignment for this store
        let assignment = assignments.find(
          (a) => a.stockId === stockId && a.store.StoreId === store.StoreId,
        );

        if (!assignment) {
          assignment = ProductAssignmentUtil.createAssignment(
            stockId,
            store,
            product,
            quantityToAssign,
          );
          assignments.push(assignment);
        } else {
          ProductAssignmentUtil.updateAssignment(
            assignment,
            product,
            quantityToAssign,
          );
        }
      }

      if (remainingQuantity > 0) {
        this.logger.warn(
          `Could not fulfill complete quantity for product ${product.productId}. Remaining: ${remainingQuantity}`,
        );
      }

      remainingProducts.shift();
    }

    this.logger.debug(
      `Store assignment completed. Created ${assignments.length} assignments`,
    );
    return assignments;
  }

  static async createStoreOrders(
    woocommerceOrder: WooCommerceOrderDto,
    assignments: StoreStockAssignment[],
    user: User,
    fsOrderService: FsOrderService,
  ): Promise<
    Array<
      StoreStockAssignment & { status: 'success' | 'error'; message?: string }
    >
  > {
    this.logger.debug(
      `Creating orders for ${assignments.length} store assignments`,
    );
    
    const results = await Promise.all(
      assignments.map(async (assignment) => {
        const orderMapped = OrderCreationUtil.prepareOrderForStore(
          woocommerceOrder,
          assignment,
        );

        return OrderCreationUtil.createOrderForStore(
          assignment,
          orderMapped,
          user,
          fsOrderService,
        );
      }),
    );

    return results;
  }
} 