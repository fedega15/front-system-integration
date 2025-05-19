import { Module } from '@nestjs/common';
import { CommonModule } from '../../../common/common.module';
import { ConfigModule } from '@nestjs/config';
import { FSProductService } from './application/service/product.service';
import { ProductController } from './controller/product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FSProduct,
  FSProductSchema,
} from '@/modules/front-systems/product/infrastucture/schemas';
import { FsProductRepository } from './infrastucture/persistance/fs-product.repository';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([
      { name: FSProduct.name, schema: FSProductSchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [FSProductService, FsProductRepository],
  exports: [FSProductService],
})
export class FSProductModule {}
