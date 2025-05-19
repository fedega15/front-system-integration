import { Module } from '@nestjs/common';
import { DashboardController } from './controller/dashboard.controller';
import { AuthModule } from '../auth/auth.module';
import { SalesReportingModule } from '../front-systems/sales-reporting/sales-reporting.module';
import { SyncModule } from '../sync/sync.module';
import { FrontSystemsModule } from '../front-systems/front-systems.module';
import { WCProductModule } from '../woocommerce/product/product.module';

@Module({
  imports: [AuthModule, SalesReportingModule, SyncModule, FrontSystemsModule, WCProductModule],
  controllers: [DashboardController],
  providers: [],
  exports: [],
})
export class DashboardModule {} 