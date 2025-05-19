import { FSStoreDto } from '@/modules/front-systems/store/application/dto';
import { OrderSyncResult } from '../interface';
import { WooCommerceOrderDto } from '@/modules/woocommerce/webhooks/application/dto';
import { OrderMapper } from './order-mapper.util';

export class ResponseBuilder {
  static createSuccessResponse(
    storeFisico: FSStoreDto,
    stockIdFisicaHeader: number,
    payload: WooCommerceOrderDto,
  ): OrderSyncResult {
    const totalItems = OrderMapper.calculateTotalItems(payload);
    return {
      status: 'success',
      message: 'Order sent to Front Systems.',
      fulfilledOrders: [{
        storeId: storeFisico.StoreId.toString(),
        stockId: stockIdFisicaHeader,
        status: 'success',
        message: 'Order created successfully',
      }],
      totalRequested: totalItems,
      totalFulfilled: totalItems,
    };
  }

  static createErrorResponse(message: string): OrderSyncResult {
    return {
      status: 'error',
      message,
      fulfilledOrders: [],
      totalRequested: 0,
      totalFulfilled: 0,
    };
  }
} 