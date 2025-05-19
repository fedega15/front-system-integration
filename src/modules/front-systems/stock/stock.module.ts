import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { StockService } from './application/service/stock.service';
import { StockReportService } from './application/service/stock-report.service';
import { FrontSystemsHttpClientService } from '@/common/application/service/front-systems-client.service';
import { StockController } from './controller/stock.controller';
import { StockReportController } from './controller/stock-report.controller';
import { StockMovementRepository } from './infrastructure/persistance/stock-movement.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { StockMovement, StockMovementSchema } from './infrastructure/schema/stock-movement.schema';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature([
      { name: StockMovement.name, schema: StockMovementSchema }
    ]),
  ],
  providers: [StockService, StockReportService, StockMovementRepository, FrontSystemsHttpClientService],
  controllers: [StockController, StockReportController]
})
export class StockModule {}
