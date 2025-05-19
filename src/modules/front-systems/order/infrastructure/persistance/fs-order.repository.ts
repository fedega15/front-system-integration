import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { FsOrder } from '../schema/fs-order.schema';
import { FrontSystemsOrderDto } from '../../application/dto';

@Injectable()
export class FsOrderRepository {
  constructor(
    @InjectModel(FsOrder.name) private FsOrderModel: Model<FsOrder>,
  ) {}

  async create(createOrderDto: FrontSystemsOrderDto): Promise<FsOrder> {
    const createdFsOrder = new this.FsOrderModel(createOrderDto);
    return createdFsOrder.save();
  }

  async findOne(id: number): Promise<FsOrder> {
    // .exec devuelve una promise
    return this.FsOrderModel.findOne({ id }).exec();
  }

  async findAll(): Promise<FsOrder[]> {
    return this.FsOrderModel.find().exec();
  }
}
