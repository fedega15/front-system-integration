import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import {
  FSCreateProductRequestDto,
  FSProductFilterRequestDto,
  FSProductResponseDto,
} from '../dto';
import { FrontSystemsHttpClientService } from '@/common/application/service/front-systems-client.service';
import { FsProductRepository } from '../../infrastucture/persistance/fs-product.repository';

interface User {
  FsSubscriptionKey?: string;
  FsApiKey?: string;
  apiKeys?: {
    frontSystem?: {
      subscriptionKey: string;
      apiKey: string;
    };
  };
}

@Injectable()
export class FSProductService {
  private readonly logger = new Logger(FSProductService.name);

  constructor(
    private readonly frontSystemsClient: FrontSystemsHttpClientService,
    private fsProductRepository: FsProductRepository,
  ) {}

  async getAllProducts(
    user: User,
    productFilter?: FSProductFilterRequestDto,
  ): Promise<FSProductResponseDto[]> {
    this.logger.debug(`Realizando petición POST a /Product`);
    this.logger.debug(`Filtro aplicado:`, productFilter);

    try {
      const products = await this.frontSystemsClient.post<
        FSProductResponseDto[]
      >(`/Product`, user, productFilter || {});

      return products.map((product) => ({
        ...product,
        productSizes: product.productSizes.map((size) => ({
          ...size,
          identifiers: Array.isArray(size.identifiers) ? size.identifiers : [],
        })),
      }));
    } catch (error) {
      this.logger.error('Error getting products:', error);
      throw error;
    }
  }

  async getProductById(
    user: User,
    productId: string,
  ): Promise<FSProductResponseDto> {
    if (!isNaN(Number(productId))) {
      try {
        const response = await this.frontSystemsClient.post<
          FSProductResponseDto[]
        >('/Product', user, {
          productId: Number(productId),
        });
        if (response.length > 0) {
          const product = response[0];
          product.productSizes = product.productSizes.map((size) => ({
            ...size,
            identifiers: size.identifiers || [],
          }));
          return product;
        }
      } catch (error) {
        this.logger.error('Error getting product by ID:', error);
        throw error;
      }
    }
    throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
  }

  async getUpdatedProducts(
    user: User,
    filter: FSProductFilterRequestDto,
  ): Promise<FSProductResponseDto[]> {
    return this.getAllProducts(user, filter);
  }

  async getProductImages(user: User, productId: string): Promise<string[]> {
    const product = await this.getProductById(user, productId);
    return product.images || [];
  }

  async createProduct(
    user: User,
    createProductDto: FSCreateProductRequestDto,
  ): Promise<FSProductResponseDto> {
    try {
      const response = await this.frontSystemsClient.post<
        FSProductResponseDto[]
      >('/Product', user, createProductDto);
      return response[0];
    } catch (error) {
      this.logger.error('Error creating product:', error);
      throw error;
    }
  }
}
