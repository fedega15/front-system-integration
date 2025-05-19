import { FSStoreDto } from '@/modules/front-systems/store/application/dto';
import { ProductStockInfo } from '../interface';

export class StockTransformer {
  static determineStockId(stockInfo: ProductStockInfo, webStockId: number): number {
    const stockWithQty = stockInfo.stockQty.find(sq => sq.stockId !== webStockId && sq.qty > 0);
    return stockWithQty ? stockWithQty.stockId : webStockId;
  }

  static determinePhysicalStore(
    salesLines: any[],
    allStores: FSStoreDto[],
    webshopStore: FSStoreDto,
  ): { storeFisico: FSStoreDto; stockIdFisicaHeader: number } {
    const stockIdFisicaHeader = salesLines.length > 0 ? salesLines[0].stockId : webshopStore.StockId;
    const storeFisico = allStores.find(store => store.StockId === stockIdFisicaHeader) || webshopStore;
    return { storeFisico, stockIdFisicaHeader };
  }
} 