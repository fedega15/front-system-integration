import {
  Controller,
  Get,
  Query,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { StockReportService } from '../application/service/stock-report.service';
import { StockMovementDTO, StockMovementSummaryDTO, StockLevelDTO } from '../application/dto/response/stock-movement.dto';

@Controller('stock-reports')
@UseGuards(JwtAuthGuard)
export class StockReportController {
  constructor(private readonly stockReportService: StockReportService) {}

  @Get('movements')
  async getMovementsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('storeId') storeId?: string,
  ): Promise<StockMovementDTO[]> {
    try {
      return await this.stockReportService.getMovementsByDateRange(
        new Date(startDate),
        new Date(endDate),
        storeId,
      );
    } catch (error) {
      throw new HttpException('Error fetching stock movements', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('movements/gtin/:gtin')
  async getMovementsByGtin(@Param('gtin') gtin: string): Promise<StockMovementDTO[]> {
    try {
      return await this.stockReportService.getMovementsByGtin(gtin);
    } catch (error) {
      throw new HttpException('Error fetching stock movements by GTIN', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('movements/stock/:stockId')
  async getMovementsByStockId(@Param('stockId') stockId: number): Promise<StockMovementDTO[]> {
    try {
      return await this.stockReportService.getMovementsByStockId(stockId);
    } catch (error) {
      throw new HttpException('Error fetching stock movements by stockId', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('summary')
  async getMovementSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('storeId') storeId?: string,
  ): Promise<StockMovementSummaryDTO> {
    try {
      return await this.stockReportService.getMovementSummary(
        new Date(startDate),
        new Date(endDate),
        storeId,
      );
    } catch (error) {
      throw new HttpException('Error fetching stock movement summary', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stock-level/:stockId')
  async getCurrentStockLevels(@Param('stockId') stockId: number): Promise<StockLevelDTO> {
    try {
      return await this.stockReportService.getCurrentStockLevels(stockId);
    } catch (error) {
      throw new HttpException('Error fetching current stock levels', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('movements/identity/:identity')
  async getMovementsByIdentity(
    @Param('identity') identity: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('stockId') stockId?: string
  ): Promise<StockMovementDTO[]> {
    try {
      return await this.stockReportService.getMovementsByIdentity(
        identity,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        stockId ? Number(stockId) : undefined
      );
    } catch (error) {
      throw new HttpException('Error fetching stock movements by identity', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 