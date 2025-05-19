import { Module, forwardRef } from '@nestjs/common';
import { WCProductService } from './application/service/product.service';
import { ProductController } from './controller/product.controller';
import { CommonModule } from '@/common/common.module';
import { ConfigModule } from '@nestjs/config';
import { WoocommerceHttpClientService } from '@/common/application/service/woocommerce-client.service';
import { WCProductAdapter } from './infrastructure/adapter/wc-product.adapter';
import { CloudinaryService } from './application/service/cloudinary.service';
import { FSProductService } from '@/modules/front-systems/product/application/service/product.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FsProductRepository } from '@/modules/front-systems/product/infrastucture/persistance/fs-product.repository';
import {
  FSProduct,
  FSProductSchema,
} from '@/modules/front-systems/product/infrastucture/schemas';
import { SyncModule } from '@/modules/sync/sync.module';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([
      { name: FSProduct.name, schema: FSProductSchema },
    ]),
    forwardRef(() => SyncModule),
  ],
  controllers: [ProductController],
  providers: [
    FsProductRepository,
    WoocommerceHttpClientService,
    WCProductService,
    WCProductAdapter,
    CloudinaryService,
    FSProductService,
  ],
  exports: [
    WoocommerceHttpClientService,
    WCProductService,
    CloudinaryService,
    FSProductService,
  ],
})
export class WCProductModule {}
