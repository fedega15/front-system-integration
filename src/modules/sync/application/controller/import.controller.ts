import { Controller, Post, Body, UseGuards, Req, HttpStatus } from '@nestjs/common';
import { ImportService } from '../service/import.service';
import { ProductFormatConfig } from '../dto/format-config.dto';
import { Request } from 'express';
import { User } from '../interface/user.interface';
import { ImportResultDto } from '../dto/import-result.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Importación de Productos')
@Controller('import')
@UseGuards(JwtAuthGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('products')
  @ApiOperation({ summary: 'Importar productos desde Front Systems a WooCommerce' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Productos importados correctamente' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error en la importación' })
  async importProducts(
    @Body() formatConfig: ProductFormatConfig,
    @Req() req: Request & { user: User }
  ): Promise<ImportResultDto> {
    return this.importService.importProducts(
      formatConfig,
      req.user.userId,
      req.user
    );
  }
} 