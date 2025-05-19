import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { WebhookService } from './application/service/webhook.service';
import { FrontSystemsHttpClientService } from '@/common/application/service/front-systems-client.service';
import { StoreModule } from '../front-systems/store/store.module';
import { SyncOrderService } from '../sync/application/service/sync-order.service';
import { WCProductService } from '../woocommerce/product/application/service/product.service';
import { FsOrderService } from '../front-systems/order/application/service/fs-order.service';
import { WCProductAdapter } from '../woocommerce/product/infrastructure/adapter/wc-product.adapter';
import { CloudinaryService } from '../woocommerce/product/application/service/cloudinary.service';
import { FSProductService } from '../front-systems/product/application/service/product.service';
import {
  ProductSchema,
  WCOrder,
  WCOrderSchema,
  WcProduct,
} from '../woocommerce/webhooks/infrastructure/schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { WoocommerceHttpClientService } from '@/common/application/service/woocommerce-client.service';
import { FsProductRepository } from '../front-systems/product/infrastucture/persistance/fs-product.repository';
import {
  FSProduct,
  FSProductSchema,
} from '../front-systems/product/infrastucture/schemas';
import { WebhookController } from './controller/webhooks.controller';
import { WebhookTenantMiddleware } from '@/common/middleware/webhook-tenant.middleware';
import { WebhookSignatureMiddleware } from '@/common/middleware/webhook-signature.middleware';
import { AuthRepository } from '../auth/infrastructure/persistance/auth.repository';
import { User, UserSchema } from '../auth/infrastructure/schemas/user.schema';
import { OrderSyncConsumer } from '../sync/application/workers/order-sync.worker';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from '../auth/auth.module';

import { WcOrderRepository } from '../woocommerce/webhooks/infrastructure/persistance/wc-order.repository';
import { WcProductRepository } from '../woocommerce/webhooks/infrastructure/persistance/wc-product.repository';
import { WebhookRepository } from './infrastructure/persistance/webhook-repository';
import {
  WebhookConfig,
  WebhookConfigSchema,
} from './infrastructure/schemas/webhook-config.schema';
import { StockMovementRepository } from '@/modules/front-systems/stock/infrastructure/persistance/stock-movement.repository';
import { StockMovement, StockMovementSchema } from '@/modules/front-systems/stock/infrastructure/schema/stock-movement.schema';

@Module({
  providers: [
    WebhookService,
    FrontSystemsHttpClientService,
    SyncOrderService,
    WCProductService,
    FsOrderService,
    WcOrderRepository,
    WcProductRepository,
    WCProductAdapter,
    CloudinaryService,
    FSProductService,
    WoocommerceHttpClientService,
    FsProductRepository,
    AuthRepository,
    OrderSyncConsumer,
    WebhookRepository,
    StockMovementRepository,
  ],
  imports: [
    StoreModule,
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([
      { name: WCOrder.name, schema: WCOrderSchema },
      { name: WcProduct.name, schema: ProductSchema },
      { name: FSProduct.name, schema: FSProductSchema },
      { name: User.name, schema: UserSchema },
      { name: WebhookConfig.name, schema: WebhookConfigSchema },
      { name: StockMovement.name, schema: StockMovementSchema },
    ]),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
      },
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 1000,
        removeOnFail: 3000,
      },
    }),
    BullModule.registerQueue(
      {
        name: 'order-sync',
      },
      {
        name: 'import-products',
      },
      {
        name: 'stock-movement',
      },
    ),
  ],
  controllers: [WebhookController],
  exports: [WebhookService],
})
export class WebhooksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WebhookTenantMiddleware).forRoutes({
      path: 'webhooks/woocommerce',
      method: RequestMethod.POST,
    });
  }
}
