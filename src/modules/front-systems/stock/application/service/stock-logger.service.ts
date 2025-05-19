import { Injectable, Logger } from '@nestjs/common';
import { StockMovement } from '../../infrastructure/schema/stock-movement.schema';

@Injectable()
export class StockLoggerService {
  private readonly logger = new Logger(StockLoggerService.name);

  logStockMovement(movement: StockMovement): void {
    this.logger.log(
      `Stock Movement | ID: ${movement.movementId} | Type: ${movement.type} | SKU: ${movement.sku} | GTIN: ${movement.gtin} | Qty: ${movement.quantity} | Stock: ${movement.stockLevel} | Reserved: ${movement.reservedLevel} | Available: ${movement.availableLevel} | StockId: ${movement.stockId} | StoreId: ${movement.storeId} | By: ${movement.createdById} | Date: ${movement.createdDateTime}`,
    );
  }

  logOrderSuccess(orderDetails: {
    orderId: string;
    items: Array<{ sku: string; gtin: string; quantity: number; stockId: number; name?: string }>;
    totalItems: number;
    storeId: string;
    orderDate?: Date;
    customerId?: string;
    totalAmount?: number;
    currency?: string;
  }): void {
    this.logger.log(
      `Order Success | OrderID: ${orderDetails.orderId} | TotalItems: ${orderDetails.totalItems} | StoreId: ${orderDetails.storeId} | Date: ${orderDetails.orderDate} | Customer: ${orderDetails.customerId} | Total: ${orderDetails.totalAmount} ${orderDetails.currency}`,
    );
    orderDetails.items.forEach(item => {
      this.logger.log(
        `  - Item | Name: ${item.name} | SKU: ${item.sku} | GTIN: ${item.gtin} | Qty: ${item.quantity} | StockId: ${item.stockId}`,
      );
    });
  }

  logStockSyncSummary(syncDetails: {
    startTime: Date;
    endTime: Date;
    totalMovements: number;
    successfulMovements: number;
    failedMovements: number;
    movementsByType: Record<string, number>;
  }): void {
    this.logger.log(
      `Stock Sync | Start: ${syncDetails.startTime} | End: ${syncDetails.endTime} | Total: ${syncDetails.totalMovements} | Success: ${syncDetails.successfulMovements} | Failed: ${syncDetails.failedMovements}`,
    );
    Object.entries(syncDetails.movementsByType).forEach(([type, count]) => {
      this.logger.log(`  - ${type}: ${count}`);
    });
  }
} 