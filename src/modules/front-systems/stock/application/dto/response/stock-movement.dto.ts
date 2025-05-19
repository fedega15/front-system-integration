export class StockMovementDTO {
  movementId: number;
  type: string;
  sku: string;
  gtin: string;
  quantity: number;
  stockLevel: number;
  reservedLevel: number;
  availableLevel: number;
  stockId: number;
  storeId: string;
  createdById: string;
  createdDateTime: Date;
  productName?: string;
  orderId?: string;
}

export class StockMovementSummaryDTO {
  totalMovements: number;
  movementsByType: Record<string, number>;
  totalQuantity: number;
  startDate: Date;
  endDate: Date;
}

export class StockLevelDTO {
  stockId: number;
  sku: string;
  gtin: string;
  currentLevel: number;
  reservedLevel: number;
  availableLevel: number;
  storeId: string;
  lastUpdated: Date;
} 