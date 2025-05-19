import { Module } from '@nestjs/common';
import { WCProductService } from './product/application/service/product.service';
import { WoocommerceHttpClientService } from '@/common/application/service/woocommerce-client.service';
import { WooCommerceWebhookService } from './webhooks/application/service/wc-webhook.service';
import { WooCommerceWebhookController } from './webhooks/controller/wc-webhook.controller';
import { WcOrderRepository } from './webhooks/infrastructure/persistance/wc-order.repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductSchema,
  WCOrder,
  WCOrderSchema,
  WcProduct,
} from './webhooks/infrastructure/schemas';
import { WebhooksModuleLegacy } from './webhooks/wc-webhook.module';
import { FsStoreService } from '../front-systems/store/application/service/store.service';
import { FrontSystemsHttpClientService } from '@/common/application/service/front-systems-client.service';
import { StoreRepository } from '../front-systems/store/infrastructure/persistance/store-repository';
import { StoreModule } from '../front-systems/store/store.module';
import { ConfigModule } from '@nestjs/config';
import { WcProductRepository } from './webhooks/infrastructure/persistance/wc-product.repository';
import {
  Store,
  StoreSchema,
} from '../front-systems/store/infrastructure/schema/store.schema';
import { WCProductAdapter } from './product/infrastructure/adapter/wc-product.adapter';
import { CloudinaryService } from './product/application/service/cloudinary.service';
import { FSProductService } from '../front-systems/product/application/service/product.service';
import { FsOrderService } from '../front-systems/order/application/service/fs-order.service';
import { FsProductRepository } from '../front-systems/product/infrastucture/persistance/fs-product.repository';
import {
  FSProduct,
  FSProductSchema,
} from '../front-systems/product/infrastucture/schemas';
import { CommonModule } from '@/common/common.module';

@Module({
  providers: [
    WCProductService,
    WcProductRepository,
    WoocommerceHttpClientService,
    WooCommerceWebhookService,
    WcOrderRepository,
    FsStoreService,
    FrontSystemsHttpClientService,
    StoreRepository,
    WebhooksModuleLegacy,
    WCProductAdapter,
    CloudinaryService,
    FSProductService,
    FsOrderService,
    FsProductRepository,
  ],
  controllers: [WooCommerceWebhookController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([
      { name: Store.name, schema: StoreSchema },
      { name: WCOrder.name, schema: WCOrderSchema },
      { name: WcProduct.name, schema: ProductSchema },
      { name: FSProduct.name, schema: FSProductSchema },
    ]),
    StoreModule,
    WebhooksModuleLegacy,
  ],
  exports: [WCProductService, StoreModule],
})
export class WooCommerceModule {}
