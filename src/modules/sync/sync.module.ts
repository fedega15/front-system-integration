import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SyncTasks } from './application/service/sync.service';
import { FrontSystemsModule } from '../front-systems/front-systems.module';
import { WooCommerceModule } from '../woocommerce/woocommerce.module';
import { CommonModule } from '@/common/common.module';
import { ConfigModule } from '@nestjs/config';
import { SyncController } from './application/controller/sync.controller';
import { CloudinaryService } from '../woocommerce/product/application/service/cloudinary.service';
import { FSProductModule } from '../front-systems/product/product.module';
import { WCProductModule } from '../woocommerce/product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ImportRecord,
  ImportRecordSchema,
} from './infrastructure/schema/import-record.schema';
import { ImportRecordRepository } from './infrastructure/persistence/import-record.repository';
import { ImportRecordController } from './application/controller/import-record.controller';
import { WCProductController } from './application/controller/wc-product.controller';
import {
  WCProduct,
  WCProductSchema,
} from './infrastructure/schema/wc-product.schema';
import { WCProductRepository } from './infrastructure/persistence/wc-product.repository';
import { AuthModule } from '@/modules/auth/auth.module';
import { AuthRepository } from '@/modules/auth/infrastructure/persistance/auth.repository';
import {
  User,
  UserSchema,
} from '@/modules/auth/infrastructure/schemas/user.schema';
import { SyncOrderService } from './application/service/sync-order.service';
import {
  Store,
  StoreSchema,
} from '../front-systems/store/infrastructure/schema/store.schema';
import {
  ProductSchema,
  WCOrder,
  WCOrderSchema,
  WcProduct,
} from '../woocommerce/webhooks/infrastructure/schemas';
import {
  FsOrder,
  FsOrderSchema,
} from '../front-systems/order/infrastructure/schema/fs-order.schema';
import {
  FSProduct,
  FSProductSchema,
} from '../front-systems/product/infrastucture/schemas';
import { FsOrderService } from '../front-systems/order/application/service/fs-order.service';
import { WcOrderRepository } from '../woocommerce/webhooks/infrastructure/persistance/wc-order.repository';
import { WcProductRepository } from '../woocommerce/webhooks/infrastructure/persistance/wc-product.repository';
import { WebhookService } from '../webhook/application/service/webhook.service';
import { ImportService } from './application/service/import.service';
import { ImportExceptionFilter } from './application/filter/import-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { ImportController } from './application/controller/import.controller';
import { ImportRecordService } from './application/service/import-history.service';
import { ProductMapper } from './application/mappers/product.mapper';
import { ScheduledSyncService } from './application/service/scheduled-sync.service';
import { ProductService } from './application/service/product.service';
import { WooCommerceCredentialsService } from './application/service/woocommerce-credentials.service';
import {
  WebhookConfig,
  WebhookConfigSchema,
} from '../webhook/infrastructure/schemas/webhook-config.schema';
import { WebhookRepository } from '../webhook/infrastructure/persistance/webhook-repository';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    FrontSystemsModule,
    WooCommerceModule,
    FSProductModule,
    forwardRef(() => WCProductModule),
    AuthModule,
    MongooseModule.forFeature([
      { name: ImportRecord.name, schema: ImportRecordSchema },
      { name: WCProduct.name, schema: WCProductSchema },
      { name: User.name, schema: UserSchema },
      { name: Store.name, schema: StoreSchema },
      { name: WCOrder.name, schema: WCOrderSchema },
      { name: WcProduct.name, schema: ProductSchema },
      { name: FsOrder.name, schema: FsOrderSchema },
      { name: FSProduct.name, schema: FSProductSchema },
      { name: WebhookConfig.name, schema: WebhookConfigSchema },
    ]),
  ],
  controllers: [
    SyncController,
    ImportRecordController,
    WCProductController,
    ImportController,
  ],
  providers: [
    SyncTasks,
    SyncOrderService,
    CloudinaryService,
    ImportRecordRepository,
    WcOrderRepository,
    WcProductRepository,
    ImportRecordService,
    WCProductRepository,
    AuthRepository,
    FsOrderService,
    WebhookService,
    WooCommerceCredentialsService,
    ImportService,
    ProductService,
    ProductMapper,
    ScheduledSyncService,
    WebhookRepository,
    {
      provide: APP_FILTER,
      useClass: ImportExceptionFilter,
    },
  ],
  exports: [
    SyncTasks,
    ImportService,
    WCProductRepository,
    ImportRecordService,
  ],
})
export class SyncModule {}
