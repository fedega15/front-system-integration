import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StockMovement } from '../schema/stock-movement.schema';

@Injectable()
export class StockMovementRepository {
  private readonly logger = new Logger(StockMovementRepository.name);

  constructor(
    @InjectModel(StockMovement.name)
    private readonly stockMovementModel: Model<StockMovement>,
  ) {}

  async create(movement: Partial<StockMovement>): Promise<StockMovement> {
    try {
      const created = new this.stockMovementModel(movement);
      return await created.save();
    } catch (error) {
      this.logger.error('Error creating stock movement', error);
      throw error;
    }
  }

  async findByStockId(stockId: number): Promise<StockMovement[]> {
    return this.stockMovementModel.find({ stockId }).sort({ createdDateTime: -1 }).exec();
  }

  async findByGtin(gtin: string): Promise<StockMovement[]> {
    return this.stockMovementModel.find({ gtin }).sort({ createdDateTime: -1 }).exec();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<StockMovement[]> {
    return this.stockMovementModel.find({
      createdDateTime: { $gte: startDate, $lte: endDate },
    }).sort({ createdDateTime: -1 }).exec();
  }

  async findByUserId(userId: string): Promise<StockMovement[]> {
    return this.stockMovementModel.find({ createdById: userId }).sort({ createdDateTime: -1 }).exec();
  }

  async findByIdentity(identity: string, startDate?: Date, endDate?: Date, stockId?: number): Promise<StockMovement[]> {
    try {
      const query: any = {
        $or: [
          { sku: identity },
          { gtin: identity }
        ]
      };
      if (startDate && endDate) {
        query.createdDateTime = { $gte: startDate, $lte: endDate };
      }
      if (stockId) {
        query.stockId = stockId;
      }
      if (!identity) {
        // Si no hay identity, devuelve todos los movimientos filtrados por fecha y stock si existen
        delete query.$or;
      }
      return this.stockMovementModel.find(query).sort({ createdDateTime: -1 }).exec();
    } catch (error) {
      this.logger.error('Error finding stock movements by identity', error);
      throw error;
    }
  }
} 