import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { SalesReportingService } from '../service/sales-reporting.service';
import { SalesReportingResponseDto } from '../dto/sales-reporting-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('sales-reporting')
export class SalesReportingController {
  constructor(private readonly salesReportingService: SalesReportingService) {}

  @Get()
  async getSalesReport(@Req() req): Promise<SalesReportingResponseDto[]> {
    return this.salesReportingService.getSalesReport(req.user);
  }
} 