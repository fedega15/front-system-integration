import { Injectable, Logger } from '@nestjs/common';
import { FsOrderService } from '@/modules/front-systems/order/application/service/fs-order.service';
import { mapWooCommerceOrderToFrontSystems } from '@/modules/woocommerce/webhooks/application/utils/mapOrderToFrontSystems';
import { WooCommerceOrderDto } from '@/modules/woocommerce/webhooks/application/dto';
import { WcProductRepository } from '@/modules/woocommerce/webhooks/infrastructure/persistance/wc-product.repository';
import { WcOrderRepository } from '@/modules/woocommerce/webhooks/infrastructure/persistance/wc-order.repository';
import { FsStoreService } from '@/modules/front-systems/store/application/service/store.service';
import { WCProductService } from '@/modules/woocommerce/product/application/service/product.service';
import { FSStoreDto } from '@/modules/front-systems/store/application/dto';
import { OrderSyncResult, ProductStockInfo } from '../interface';
import { OrderMapper } from '../utils/order-mapper.util';
import { StockTransformer } from '../utils/stock-transformer.util';
import { ResponseBuilder } from '../utils/response-builder.util';
import {
  validateOrderAndCredentials,
  validateWebshopStore,
} from '../functions/order-validation.function';
import { getWooCommerceCredentials } from '../functions/credentials.function';
import { User } from '@/modules/auth/infrastructure/schemas/user.schema';

@Injectable()
export class SyncOrderService {
  private readonly logger = new Logger(SyncOrderService.name);

  constructor(
    private readonly fsOrderService: FsOrderService,
    private readonly wcProductRepository: WcProductRepository,
    private readonly wcOrderRepository: WcOrderRepository,
    private readonly fsStoreService: FsStoreService,
    private readonly wcProductService: WCProductService,
  ) {}

  private async getStoreInformation(
    user: User,
  ): Promise<{ webshopStore: FSStoreDto; allStores: FSStoreDto[] }> {
    this.logger.debug('Getting store information for user:', {
      userId: user._id,
      hasFrontSystemKeys: !!(user.FsSubscriptionKey && user.FsApiKey),
    });

    if (!user.FsSubscriptionKey || !user.FsApiKey) {
      throw new Error('Front Systems API keys not found for user');
    }

    this.logger.debug('User before calling getStores:', {
      id: user?._id,
      FsSubscriptionKey: user?.FsSubscriptionKey,
      FsApiKey: user?.FsApiKey,
      all: user,
    });
    const allStores = await this.fsStoreService.getStores(user);
    const webshopStore = allStores.find((store) =>
      store.StoreName?.toLowerCase().includes('webshop'),
    );
    validateWebshopStore(webshopStore);
    return { webshopStore, allStores };
  }

  async handleOrderCreated(
    payload: WooCommerceOrderDto,
    user: User,
  ): Promise<OrderSyncResult> {
    this.logger.debug('Starting order sync for order ID:', payload.id);

    try {
      // Validate order and credentials
      const existingOrder = await this.wcOrderRepository.findOne(payload.id);
      await validateOrderAndCredentials(existingOrder, payload, user);

      // Get store information
      const { webshopStore, allStores } = await this.getStoreInformation(user);

      // Process order items and get stock information
      const credentials = getWooCommerceCredentials(user);
      const orderItems = OrderMapper.mapOrderItems(payload);
      const products = await Promise.all(
        orderItems.map(async (item) => {
          const wcProduct = await this.wcProductService.retrieveProduct(
            item.product_id,
            credentials,
          );
          const size = OrderMapper.extractSizeFromMetaData(item.meta_data);
          const stockInfo = OrderMapper.extractStockInfo(wcProduct, size);
          const stockIdFisica = StockTransformer.determineStockId(
            stockInfo,
            webshopStore.StockId,
          );

          return {
            ...stockInfo,
            text: item.name,
            price: parseFloat(item.price),
            qty: item.quantity,
            stockId: stockIdFisica,
            vat: parseFloat(item.total_tax) / parseFloat(item.price || '1'),
          };
        }),
      );

      // Map order to Front Systems format
      const orderMapped = mapWooCommerceOrderToFrontSystems(
        payload,
        webshopStore.StockId,
        webshopStore,
        products,
      );

      // Create order in Front Systems
      const fsOrder = await this.fsOrderService.createOrder(
        user,
        orderMapped,
        webshopStore.StockId.toString(),
      );

      // Save order to database
      await this.wcOrderRepository.create(payload);

      return ResponseBuilder.createSuccessResponse(
        webshopStore,
        webshopStore.StockId,
        payload,
      );
    } catch (error) {
      this.logger.error('Error processing order:', {
        orderId: payload.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseBuilder.createErrorResponse(
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
