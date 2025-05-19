import { Module } from '@nestjs/common';
import configuration from './configuration/environment.configuration';
import { configurationValidate } from './configuration/configuration.validate';
import { ConfigModule } from '@nestjs/config';
import { FrontSystemsModule } from './modules/front-systems/front-systems.module';
import { WooCommerceModule } from './modules/woocommerce/woocommerce.module';
import { SyncModule } from './modules/sync/sync.module';
import { StockModule } from './modules/front-systems/stock/stock.module';
import { FSProductModule } from './modules/front-systems/product/product.module';
import { WCProductModule } from './modules/woocommerce/product/product.module';
import { FrontSystemsHttpClientService } from './common/application/service/front-systems-client.service';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreModule } from './modules/front-systems/store/store.module';
import { AuthModule } from './modules/auth/auth.module';
import { WebhooksModule } from './modules/webhook/webhook.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: configurationValidate,
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    FrontSystemsModule,
    WooCommerceModule,
    StoreModule,
    WebhooksModule,
    StockModule,
    FSProductModule,
    WCProductModule,
    AuthModule,
    SyncModule,
    DashboardModule,
  ],
  providers: [FrontSystemsHttpClientService],
})
export class AppModule {}
