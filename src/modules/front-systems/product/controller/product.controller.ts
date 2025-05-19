import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

import { FSProductService } from '../application/service/product.service';
import { FSProductResponseDto, FSCreateProductRequestDto, FSProductFilterRequestDto } from '../application/dto';

@Controller('front-systems')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: FSProductService) { }

  @Post('/all-products')
  async getAllProducts(
    @CurrentUser() user: any,
    @Body() productFilter?: FSProductFilterRequestDto,
  ): Promise<FSProductResponseDto[]> {
    try {
      return await this.productService.getAllProducts(user, productFilter);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('/product/:id')
  async getProductById(
    @CurrentUser() user: any,
    @Param('id') productId: string,
  ): Promise<FSProductResponseDto> {
    try {
      return await this.productService.getProductById(user, productId);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post('/create-product')
  async createProduct(
    @CurrentUser() user: any,
    @Body() product: FSCreateProductRequestDto,
  ): Promise<FSProductResponseDto> {
    try {
      return await this.productService.createProduct(user, product);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post('/updated-products')
  async getUpdatedProducts(
    @CurrentUser() user: any,
    @Body() filter: FSProductFilterRequestDto,
  ): Promise<FSProductResponseDto[]> {
    try {
      return await this.productService.getUpdatedProducts(user, filter);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('/product/:id/images')
  async getProductImages(
    @CurrentUser() user: any,
    @Param('id') productId: string,
  ): Promise<string[]> {
    try {
      return await this.productService.getProductImages(user, productId);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(
      'Error al procesar la solicitud',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
