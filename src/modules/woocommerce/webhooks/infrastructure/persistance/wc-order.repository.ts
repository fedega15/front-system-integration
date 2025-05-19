import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WooCommerceOrderDto } from '../../application/dto';
import { WCOrder } from '../schemas';

@Injectable()
export class WcOrderRepository {
  constructor(
    @InjectModel(WCOrder.name) private WCOrderModel: Model<WCOrder>,
  ) {}

  async create(orderDto: WooCommerceOrderDto): Promise<WCOrder> {
    const createdWcOrder = new this.WCOrderModel(orderDto);
    return createdWcOrder.save();
  }

  async findOne(id: number): Promise<WCOrder> {
    // .exec devuelve una promise
    return this.WCOrderModel.findOne({ id }).exec();
  }

  async findAll(): Promise<WCOrder[]> {
    return this.WCOrderModel.find().exec();
  }
}
