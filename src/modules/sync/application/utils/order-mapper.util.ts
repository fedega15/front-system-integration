import { WooCommerceOrderDto } from '@/modules/woocommerce/webhooks/application/dto';
import { ProductStockInfo } from '../interface';
import { BadRequestException } from '@nestjs/common';
import { extractGtinAndStock } from '@/modules/woocommerce/webhooks/application/utils/extractGtinAndStock';

export class OrderMapper {
  static mapOrderItems(payload: WooCommerceOrderDto) {
    return payload.line_items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      total_tax: item.total_tax,
      meta_data: item.meta_data,
    }));
  }

  static extractSizeFromMetaData(metaData: any[]): string | undefined {
    return metaData?.find(m => m.key.toLowerCase().includes('size'))?.value;
  }

  static calculateTotalItems(payload: WooCommerceOrderDto): number {
    return payload.line_items.reduce((sum, item) => sum + item.quantity, 0);
  }

  static extractStockInfo(wcProduct: any, size: string | undefined): ProductStockInfo {
    const stockInfo = extractGtinAndStock(wcProduct, undefined, size);
    if (!stockInfo || !stockInfo.identity) {
      throw new BadRequestException(`No identity or stock info for product ${wcProduct.id} (size: ${size})`);
    }
    return {
      productId: wcProduct.id,
      gtin: stockInfo.gtin,
      stockQty: stockInfo.stockQty,
      stockIds: stockInfo.stocksIds,
      identity: stockInfo.identity,
      requiredQuantity: 1, // Default value, should be adjusted based on business logic
    };
  }
} 