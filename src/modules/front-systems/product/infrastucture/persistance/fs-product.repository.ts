import { Injectable } from '@nestjs/common';
import { FSProduct } from '../schemas';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { FSProductResponseDto } from '../../application/dto';

@Injectable()
// implements IServicesRepository
export class FsProductRepository {
  constructor(
    @InjectModel(FSProduct.name) private FSProductModel: Model<FSProduct>,
  ) {}

  async create(createProductDto: FSProductResponseDto): Promise<FSProduct> {
    const createdFSProduct = new this.FSProductModel(createProductDto);
    return createdFSProduct.save();
  }

  async findAll(): Promise<FSProduct[]> {
    return this.FSProductModel.find().exec();
  }
}
