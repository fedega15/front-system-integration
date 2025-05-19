import { Injectable, Logger } from '@nestjs/common';
import { StockMovementRepository } from '../../infrastructure/persistance/stock-movement.repository';
import { StockMovementDTO, StockMovementSummaryDTO, StockLevelDTO } from '../dto/response/stock-movement.dto';

@Injectable()
export class StockReportService {
  private readonly logger = new Logger(StockReportService.name);

  constructor(
    private readonly stockMovementRepository: StockMovementRepository,
  ) {}

  async getMovementsByDateRange(
    startDate: Date,
    endDate: Date,
    storeId?: string,
  ): Promise<StockMovementDTO[]> {
    const movements = await this.stockMovementRepository.findByDateRange(startDate, endDate);
    return movements
      .filter(m => !storeId || m.storeId === storeId)
      .map(movement => ({
        movementId: movement.movementId,
        type: movement.type,
        sku: movement.sku,
        gtin: movement.gtin,
        quantity: movement.quantity,
        stockLevel: movement.stockLevel,
        reservedLevel: movement.reservedLevel,
        availableLevel: movement.availableLevel,
        stockId: movement.stockId,
        storeId: movement.storeId,
        createdById: movement.createdById.toString(),
        createdDateTime: movement.createdDateTime,
        productName: movement.productName,
        orderId: movement.orderId,
      }));
  }

  async getMovementsByGtin(gtin: string): Promise<StockMovementDTO[]> {
    const movements = await this.stockMovementRepository.findByGtin(gtin);
    return movements.map(movement => ({
      movementId: movement.movementId,
      type: movement.type,
      sku: movement.sku,
      gtin: movement.gtin,
      quantity: movement.quantity,
      stockLevel: movement.stockLevel,
      reservedLevel: movement.reservedLevel,
      availableLevel: movement.availableLevel,
      stockId: movement.stockId,
      storeId: movement.storeId,
      createdById: movement.createdById.toString(),
      createdDateTime: movement.createdDateTime,
      productName: movement.productName,
      orderId: movement.orderId,
    }));
  }

  async getMovementsByStockId(stockId: number): Promise<StockMovementDTO[]> {
    const movements = await this.stockMovementRepository.findByStockId(stockId);
    return movements.map(movement => ({
      movementId: movement.movementId,
      type: movement.type,
      sku: movement.sku,
      gtin: movement.gtin,
      quantity: movement.quantity,
      stockLevel: movement.stockLevel,
      reservedLevel: movement.reservedLevel,
      availableLevel: movement.availableLevel,
      stockId: movement.stockId,
      storeId: movement.storeId,
      createdById: movement.createdById.toString(),
      createdDateTime: movement.createdDateTime,
      productName: movement.productName,
      orderId: movement.orderId,
    }));
  }

  async getMovementSummary(
    startDate: Date,
    endDate: Date,
    storeId?: string,
  ): Promise<StockMovementSummaryDTO> {
    const movements = await this.getMovementsByDateRange(startDate, endDate, storeId);
    const movementsByType: Record<string, number> = {};
    let totalQuantity = 0;
    movements.forEach(m => {
      movementsByType[m.type] = (movementsByType[m.type] || 0) + 1;
      totalQuantity += m.quantity;
    });
    return {
      totalMovements: movements.length,
      movementsByType,
      totalQuantity,
      startDate,
      endDate,
    };
  }

  async getCurrentStockLevels(stockId: number): Promise<StockLevelDTO> {
    const movements = await this.stockMovementRepository.findByStockId(stockId);
    if (!movements.length) {
      throw new Error('No movements found for this stockId');
    }
    const last = movements[0];
    return {
      stockId: last.stockId,
      sku: last.sku,
      gtin: last.gtin,
      currentLevel: last.stockLevel,
      reservedLevel: last.reservedLevel,
      availableLevel: last.availableLevel,
      storeId: last.storeId,
      lastUpdated: last.createdDateTime,
    };
  }

  async getMovementsByIdentity(identity: string, startDate?: Date, endDate?: Date, stockId?: number): Promise<StockMovementDTO[]> {
    const movements = await this.stockMovementRepository.findByIdentity(identity, startDate, endDate, stockId);
    return movements.map(movement => ({
      movementId: movement.movementId,
      type: movement.type,
      sku: movement.sku,
      gtin: movement.gtin,
      quantity: movement.quantity,
      stockLevel: movement.stockLevel,
      reservedLevel: movement.reservedLevel,
      availableLevel: movement.availableLevel,
      stockId: movement.stockId,
      storeId: movement.storeId,
      createdById: movement.createdById.toString(),
      createdDateTime: movement.createdDateTime,
      productName: movement.productName,
      orderId: movement.orderId,
    }));
  }
} 