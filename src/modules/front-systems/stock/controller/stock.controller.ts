import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpException,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { StockService } from '../application/service/stock.service';
import {
  FSStockFilterRequestDto,
  FSStockResponseDto,
  StockCountFilterDTO,
  StockCountResponseDTO,
  StockQuantityDTO,
} from '../application/dto';

@Controller('front-system')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) { }

  @Post('count')
  async getStockQuantityCount(
    @CurrentUser() user: any,
    @Body() filter: StockCountFilterDTO,
  ): Promise<StockCountResponseDTO> {
    try {
      return await this.stockService.getStockQuantityCount(user, filter);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Ocurrió un error inesperado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get(':gtin')
  async getStockQuantityByGTIN(
    @CurrentUser() user: any,
    @Param('gtin') gtin: string,
  ): Promise<StockQuantityDTO[]> {
    return this.stockService.getStockQuantityByGTIN(user, gtin);
  }

  @Post('/stock')
  async getStock(
    @CurrentUser() user: any,
    @Body() stockFilter: FSStockFilterRequestDto,
  ): Promise<FSStockResponseDto[]> {
    try {
      return await this.stockService.getStock(user, stockFilter);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Ocurrió un error inesperado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get('/stock/product/:id')
  async getStockByProductId(
    @CurrentUser() user: any,
    @Param('id') productId: string,
  ): Promise<FSStockResponseDto[]> {
    try {
      return await this.stockService.getStockByProductId(user, productId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Ocurrió un error inesperado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Post('/stock/adjust')
  async adjustStockQuantity(
    @CurrentUser() user: any,
    @Body() body: { productId: string; quantity: number },
  ): Promise<void> {
    try {
      await this.stockService.adjustStockQuantity(
        user,
        body.productId,
        body.quantity,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Ocurrió un error inesperado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Put('/stock/correct')
  async correctStockQuantity(
    @CurrentUser() user: any,
    @Body() body: { productId: string; quantity: number },
  ): Promise<void> {
    try {
      await this.stockService.correctStockQuantity(
        user,
        body.productId,
        body.quantity,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Ocurrió un error inesperado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get('/stock/gtin/:gtin')
  async getStockByGTIN(
    @CurrentUser() user: any,
    @Param('gtin') gtin: string,
  ): Promise<FSStockResponseDto[]> {
    try {
      return await this.stockService.getStockByGTIN(user, gtin);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Ocurrió un error inesperado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get('/stock/identity/:identity')
  async getStockByIdentity(
    @CurrentUser() user: any,
    @Param('identity') identity: string,
  ): Promise<FSStockResponseDto> {
    try {
      return await this.stockService.getStockByIdentity(user, identity);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Ocurrió un error inesperado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get('/stock/settings')
  async getStockSettings(@CurrentUser() user: any): Promise<any> {
    try {
      return await this.stockService.getStockSettings(user);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Ocurrió un error inesperado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get('/stock/list')
  async getStockList(@CurrentUser() user: any): Promise<any> {
    try {
      return await this.stockService.getStockList(user);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Ocurrió un error inesperado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
