import {
  Controller,
  Post,
  Get,
  Body,
  HttpException,
  HttpStatus,
  Param,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { WCProductService } from '../application/service/product.service';
import {
  WCCreateProductRequestDTO,
  WCProductDTO,
  WCProductAttributeRequestDto,
  WCProductAttributeResponseDto,
  WCProductVariationRequestDto,
} from '../application/dto';
import { SyncTasks } from '@/modules/sync/application/service/sync.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { SensitiveData } from '@/modules/auth/application/types/auth-interfaces';

interface User {
  userId: string;
  username: string;
  role: string;
  Orgnum?: string;
  LegalName?: string;
  apiKeys: SensitiveData;
}

@Controller('woocommerce')
@UseGuards(JwtAuthGuard)
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(
    private readonly productService: WCProductService,
    private readonly syncService: SyncTasks,
  ) {}

  @Post('/create-product')
  async createProduct(
    @Body() productData: WCCreateProductRequestDTO,
    @CurrentUser() user: User
  ): Promise<WCProductDTO> {
    if (!user?.apiKeys?.wooCommerce) {
      throw new HttpException('WooCommerce credentials not found', HttpStatus.UNAUTHORIZED);
    }

    const credentials = {
      consumerKey: user.apiKeys.wooCommerce.consumerKey,
      consumerSecret: user.apiKeys.wooCommerce.consumerSecret,
      url: user.apiKeys.wooCommerce.url
    };
    try {
      return await this.productService.createProduct(productData, credentials);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post('/create-product-attribute')
  async createProductAttribute(
    @Body() attributeData: WCProductAttributeRequestDto,
    @CurrentUser() user: User
  ): Promise<WCProductAttributeResponseDto> {
    if (!user?.apiKeys?.wooCommerce) {
      throw new HttpException('WooCommerce credentials not found', HttpStatus.UNAUTHORIZED);
    }

    const credentials = {
      consumerKey: user.apiKeys.wooCommerce.consumerKey,
      consumerSecret: user.apiKeys.wooCommerce.consumerSecret,
      url: user.apiKeys.wooCommerce.url
    };
    try {
      return await this.productService.createAttribute(attributeData, credentials);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('/products')
  async getProducts(
    @CurrentUser() user: User
  ): Promise<WCProductDTO[]> {
    this.logger.debug('Received user in getProducts:', {
      userId: user?.userId,
      username: user?.username,
      hasApiKeys: !!user?.apiKeys,
      hasWooCommerce: !!user?.apiKeys?.wooCommerce,
      wooCommerceData: user?.apiKeys?.wooCommerce,
      apiKeys: user?.apiKeys
    });

    if (!user?.apiKeys?.wooCommerce) {
      throw new HttpException('WooCommerce credentials not found', HttpStatus.UNAUTHORIZED);
    }

    const credentials = {
      consumerKey: user.apiKeys.wooCommerce.consumerKey,
      consumerSecret: user.apiKeys.wooCommerce.consumerSecret,
      url: user.apiKeys.wooCommerce.url
    };

    this.logger.debug('Using WooCommerce credentials:', {
      hasConsumerKey: !!credentials.consumerKey,
      hasConsumerSecret: !!credentials.consumerSecret,
      hasUrl: !!credentials.url
    });

    try {
      return await this.productService.getProducts(credentials);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post(':id/variations')
  async createProductVariation(
    @Param('id') productId: number,
    @Body() variationData: WCProductVariationRequestDto,
    @CurrentUser() user: User
  ): Promise<{ message: string }> {
    if (!user?.apiKeys?.wooCommerce) {
      throw new HttpException('WooCommerce credentials not found', HttpStatus.UNAUTHORIZED);
    }

    const credentials = {
      consumerKey: user.apiKeys.wooCommerce.consumerKey,
      consumerSecret: user.apiKeys.wooCommerce.consumerSecret,
      url: user.apiKeys.wooCommerce.url
    };
    try {
      await this.productService.createProductVariation(
        productId,
        variationData,
        credentials
      );
      return { message: 'Variación creada exitosamente' };
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
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
