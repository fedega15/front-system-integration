import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { CoreService } from './core/application/service/api.service';
import { StockService } from './stock/application/service/stock.service';
import { FSProductService } from './product/application/service/product.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FSProduct, FSProductSchema } from './product/infrastucture/schemas';
import { FsProductRepository } from './product/infrastucture/persistance/fs-product.repository';
import { FsStoreService } from './store/application/service/store.service';
import { StoreRepository } from './store/infrastructure/persistance/store-repository';
import { ConfigModule } from '@nestjs/config';
import { StoreModule } from './store/store.module';
import { Store, StoreSchema } from './store/infrastructure/schema/store.schema';
import { FrontSystemsOrderModule } from './order/fs-order.module';
import { SalesReportingModule } from './sales-reporting/sales-reporting.module';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([
      { name: FSProduct.name, schema: FSProductSchema },
      { name: Store.name, schema: StoreSchema },
    ]),
    StoreModule,
    FrontSystemsOrderModule,
    SalesReportingModule,
  ],
  providers: [
    CoreService,
    StockService,
    FSProductService,
    FsProductRepository,
    FsStoreService,
    StoreRepository,
  ],
  exports: [
    CoreService,
    StockService,
    FSProductService,
    FsProductRepository,
    FsStoreService,
    StoreRepository,
  ],
})
export class FrontSystemsModule {}
