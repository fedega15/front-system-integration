import { Module } from '@nestjs/common';
import { SalesReportingController } from './application/controller/sales-reporting.controller';
import { SalesReportingService } from './application/service/sales-reporting.service';

@Module({
  controllers: [SalesReportingController],
  providers: [SalesReportingService],
  exports: [SalesReportingService],
})
export class SalesReportingModule {} 