import { FSStoreDto } from '@/modules/front-systems/store/application/dto';
import { IStockQty } from '@/modules/webhook/application/interface/stock.interface';

export interface ProductStockInfo {
  productId: number;
  gtin: string;
  stockQty: IStockQty[];
  stockIds: number[];
  identity: number;
  requiredQuantity: number;
}

export interface StoreStockAssignment {
  store: FSStoreDto;
  stockId: number;
  products: Array<{
    productId: number;
    quantity: number;
    gtin: string;
    identity: number;
  }>;
}

export interface OrderSyncResult {
  status: 'success' | 'partial' | 'error';
  message: string;
  fulfilledOrders: Array<{
    storeId: string;
    stockId: number;
    status: 'success' | 'error';
    message?: string;
  }>;
  totalRequested: number;
  totalFulfilled: number;
} 