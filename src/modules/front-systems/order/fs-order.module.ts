import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { FsOrderService } from './application/service/fs-order.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FsOrder,
  FsOrderSchema,
} from './infrastructure/schema/fs-order.schema';
import { FsOrderRepository } from './infrastructure/persistance/fs-order.repository';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([{ name: FsOrder.name, schema: FsOrderSchema }]),
  ],
  providers: [
    // CoreService,
    // StockService,
    // FSProductService,
    FsOrderRepository,
    FsOrderService,
    // FsStoreService,
    // StoreRepository,
  ],
  exports: [
    FsOrderService,
    FsOrderRepository,
    // CoreService,
    // StockService,
    // FSProductService,
    // FsProductRepository,
    // FsStoreService,
    // StoreRepository,
  ],
})
export class FrontSystemsOrderModule {}
