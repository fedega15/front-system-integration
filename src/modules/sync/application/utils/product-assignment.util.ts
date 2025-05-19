import { Logger } from '@nestjs/common';
import { FSStoreDto } from '@/modules/front-systems/store/application/dto';
import { ProductStockInfo, StoreStockAssignment } from '../interface';

export class ProductAssignmentUtil {
  private static readonly logger = new Logger(ProductAssignmentUtil.name);

  static findStoreForAllProducts(
    products: ProductStockInfo[],
    storesByStockId: Map<number, FSStoreDto>,
  ): StoreStockAssignment | null {
    for (const [stockId, store] of storesByStockId) {
      this.logger.debug(
        `Checking if store ${store.StoreName} can fulfill all products`,
      );
      const canFulfillAll = products.every((product) => {
        const stockQty = product.stockQty.find((sq) => sq.stockId === stockId);
        return stockQty && stockQty.qty >= product.requiredQuantity;
      });

      if (canFulfillAll) {
        this.logger.debug(`Store ${store.StoreName} can fulfill all products`);
        return {
          store,
          stockId,
          products: products.map((product) => ({
            productId: product.productId,
            quantity: product.requiredQuantity,
            gtin: product.gtin,
            identity: product.identity,
          })),
        };
      }
    }
    return null;
  }

  static findAvailableStores(
    product: ProductStockInfo,
    storesByStockId: Map<number, FSStoreDto>,
  ): Array<{ stockId: number; store: FSStoreDto; availableQty: number }> {
    return Array.from(storesByStockId.entries())
      .map(([stockId, store]) => {
        const stockQty = product.stockQty.find(
          (sq) => sq.stockId === stockId,
        );
        return {
          stockId,
          store,
          availableQty: stockQty ? stockQty.qty : 0,
        };
      })
      .filter((store) => store.availableQty > 0)
      .sort((a, b) => b.availableQty - a.availableQty);
  }

  static createAssignment(
    stockId: number,
    store: FSStoreDto,
    product: ProductStockInfo,
    quantity: number,
  ): StoreStockAssignment {
    return {
      store,
      stockId,
      products: [{
        productId: product.productId,
        quantity,
        gtin: product.gtin,
        identity: product.identity,
      }],
    };
  }

  static updateAssignment(
    assignment: StoreStockAssignment,
    product: ProductStockInfo,
    quantity: number,
  ): void {
    assignment.products.push({
      productId: product.productId,
      quantity,
      gtin: product.gtin,
      identity: product.identity,
    });
  }
} 