import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WcProduct } from '../schemas';
import { WCProductDTO } from '@/modules/woocommerce/product/application/dto';

@Injectable()
export class WcProductRepository {
  constructor(
    @InjectModel(WcProduct.name) private WcProductModel: Model<WcProduct>,
  ) {}

  async create(createProductDto: WCProductDTO): Promise<WcProduct> {
    const createdWcProduct = new this.WcProductModel(createProductDto);
    return createdWcProduct.save();
  }

  async findOne(id: number): Promise<WcProduct> {
    // .exec devuelve una promise
    return this.WcProductModel.findOne({ id }).exec();
  }

  async findAll(): Promise<WcProduct[]> {
    return this.WcProductModel.find().exec();
  }
}
