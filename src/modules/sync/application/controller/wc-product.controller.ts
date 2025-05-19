import { Controller, Get, Param, Query, UseGuards, Request, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { WCProductRepository } from '../../infrastructure/persistence/wc-product.repository';

@Controller('wc-products')
@UseGuards(JwtAuthGuard)
export class WCProductController {
  private readonly logger = new Logger(WCProductController.name);

  constructor(
    private readonly wcProductRepository: WCProductRepository,
  ) {}

  @Get()
  async getProducts(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    this.logger.debug('Getting products for user:', {
      userId: req.user?.userId,
      companyId: req.user?.Orgnum,
      page,
      limit
    });

    if (!req.user?.userId || !req.user?.Orgnum) {
      throw new HttpException('User ID or Company ID not found', HttpStatus.BAD_REQUEST);
    }

    try {
      const { products, total } = await this.wcProductRepository.findByUserIdAndCompanyIdPaginated(
        req.user.userId,
        req.user.Orgnum,
        parseInt(page),
        parseInt(limit)
      );

      return {
        data: products,
        meta: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      this.logger.error('Error fetching products:', error);
      throw new HttpException('Error fetching products', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getProductById(@Request() req, @Param('id') id: string) {
    this.logger.debug('Getting product by ID:', {
      userId: req.user?.userId,
      companyId: req.user?.Orgnum,
      productId: id
    });

    if (!req.user?.userId || !req.user?.Orgnum) {
      throw new HttpException('User ID or Company ID not found', HttpStatus.BAD_REQUEST);
    }

    try {
      const product = await this.wcProductRepository.findById(id);

      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      // Verify that the product belongs to the user's company
      if (product.userId !== req.user.userId || product.companyId !== req.user.Orgnum) {
        throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
      }

      return product;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error fetching product:', error);
      throw new HttpException('Error fetching product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 