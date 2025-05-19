import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WCProduct } from '../schema/wc-product.schema';

@Injectable()
export class WCProductRepository {
  private readonly logger = new Logger(WCProductRepository.name);

  constructor(
    @InjectModel(WCProduct.name)
    private readonly wcProductModel: Model<WCProduct>,
  ) {}

  async create(data: Partial<WCProduct>): Promise<WCProduct> {
    this.logger.debug('Creating WC product:', data);
    const createdProduct = new this.wcProductModel(data);
    return createdProduct.save();
  }

  async findByUserIdAndCompanyId(userId: string, companyId: string): Promise<WCProduct[]> {
    this.logger.debug('Finding products by userId and companyId:', { userId, companyId });
    const products = await this.wcProductModel
      .find({ userId, companyId })
      .sort({ importedAt: -1 })
      .exec();
    this.logger.debug(`Found ${products.length} products for userId ${userId} and companyId ${companyId}`);
    return products;
  }

  async findById(id: string): Promise<WCProduct> {
    return this.wcProductModel.findById(id).exec();
  }

  async findByWcId(wcId: number): Promise<WCProduct> {
    return this.wcProductModel.findOne({ wcId }).exec();
  }

  async findBySku(sku: string): Promise<WCProduct> {
    return this.wcProductModel.findOne({ sku }).exec();
  }

  async update(id: string, data: Partial<WCProduct>): Promise<WCProduct> {
    this.logger.debug('Updating WC product:', { id, data });
    return this.wcProductModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async delete(id: string): Promise<WCProduct> {
    return this.wcProductModel.findByIdAndDelete(id).exec();
  }

  async findByUserIdAndCompanyIdPaginated(
    userId: string, 
    companyId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{ products: WCProduct[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      this.wcProductModel
        .find({ userId, companyId })
        .sort({ importedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.wcProductModel.countDocuments({ userId, companyId })
    ]);

    return { products, total };
  }
} 