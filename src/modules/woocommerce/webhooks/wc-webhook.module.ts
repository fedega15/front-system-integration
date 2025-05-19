import { Module } from '@nestjs/common';
import { WooCommerceWebhookService } from './application/service/wc-webhook.service';
import { WoocommerceHttpClientService } from '@/common/application/service/woocommerce-client.service';
import { WooCommerceWebhookController } from './controller/wc-webhook.controller';
import { WCProductService } from '../product/application/service/product.service';
import { FsStoreService } from '@/modules/front-systems/store/application/service/store.service';
import { FrontSystemsHttpClientService } from '@/common/application/service/front-systems-client.service';
import { StoreRepository } from '@/modules/front-systems/store/infrastructure/persistance/store-repository';
import { StoreModule } from '@/modules/front-systems/store/store.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Store,
  StoreSchema,
} from '@/modules/front-systems/store/infrastructure/schema/store.schema';
import {
  ProductSchema,
  WCOrder,
  WCOrderSchema,
  WcProduct,
} from './infrastructure/schemas';
import { WcOrderRepository } from './infrastructure/persistance/wc-order.repository';
import { WcProductRepository } from './infrastructure/persistance/wc-product.repository';
import { FsOrderService } from '@/modules/front-systems/order/application/service/fs-order.service';
import {
  FsOrder,
  FsOrderSchema,
} from '@/modules/front-systems/order/infrastructure/schema/fs-order.schema';
import { WCProductAdapter } from '../product/infrastructure/adapter/wc-product.adapter';
import { CloudinaryService } from '../product/application/service/cloudinary.service';
import { FSProductService } from '@/modules/front-systems/product/application/service/product.service';
import { FsProductRepository } from '@/modules/front-systems/product/infrastucture/persistance/fs-product.repository';
import {
  FSProduct,
  FSProductSchema,
} from '@/modules/front-systems/product/infrastucture/schemas';
import { FSProductModule } from '@/modules/front-systems/product/product.module';

@Module({
  imports: [
    StoreModule,
    FSProductModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([
      { name: Store.name, schema: StoreSchema },
      { name: WCOrder.name, schema: WCOrderSchema },
      { name: WcProduct.name, schema: ProductSchema },
      { name: FsOrder.name, schema: FsOrderSchema },
      { name: FSProduct.name, schema: FSProductSchema },
    ]),
  ],
  controllers: [WooCommerceWebhookController],
  providers: [
    WCProductAdapter,
    FsProductRepository,
    FSProductService,
    CloudinaryService,
    FsOrderService,
    WCProductService,
    WcOrderRepository,
    WcProductRepository,
    StoreRepository,
    FsStoreService,
    FrontSystemsHttpClientService,
    WooCommerceWebhookService,
    WoocommerceHttpClientService,
  ],
})
export class WebhooksModuleLegacy {}
