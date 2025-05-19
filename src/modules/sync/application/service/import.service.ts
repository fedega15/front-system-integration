import { Injectable, Logger } from '@nestjs/common';
import { FSProductService } from '@/modules/front-systems/product/application/service/product.service';
import { WCProductService } from '@/modules/woocommerce/product/application/service/product.service';
import { FSProductResponseDto } from '@/modules/front-systems/product/application/dto/response/product.dto';
import { WCProductDTO } from '@/modules/woocommerce/product/application/dto';
import { CloudinaryService } from '@/modules/woocommerce/product/application/service/cloudinary.service';
import { ImportRecordRepository } from '../../infrastructure/persistence/import-record.repository';
import { ProductFormatConfig } from '../dto/format-config.dto';
import { WCProductRepository } from '../../infrastructure/persistence/wc-product.repository';
import { WooCommerceCredentials } from '@/modules/woocommerce/product/application/dto/woocommerce-credentials.dto';
import { User } from '../interface/user.interface';
import { ProductMapper } from '../mappers/product.mapper';
import { TextUtils } from '../utils/text.utils';
import { ImageUtils } from '../utils/image.utils';
import { ImportResultDto } from '../dto/import-result.dto';
import { CacheUtils } from '../utils/cache.utils';
import {
  ImportException,
  InvalidCredentialsException,
  ProductProcessingException,
  InvalidProductDataException,
  DatabaseOperationException,
} from '../exception/import.exception';
import { ProductService } from './product.service';

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    private readonly frontSystemsService: FSProductService,
    private readonly wcProductService: WCProductService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly importRecordRepository: ImportRecordRepository,
    private readonly wcProductRepository: WCProductRepository,
    private readonly productMapper: ProductMapper,
    private readonly productService: ProductService,
  ) {}

  async importProducts(
    formatConfig: ProductFormatConfig,
    userId: string,
    user: User,
  ): Promise<ImportResultDto> {
    const startTime = new Date();
    try {
      this.logger.log(`User ID: ${userId}`);

      if (!user || !user.Orgnum) {
        throw new InvalidProductDataException(
          'user',
          'Usuario inválido o sin Orgnum',
        );
      }

      const wooCommerceCredentials =
        this.validateAndGetWooCommerceCredentials(user);
      const frontProducts = await this.frontSystemsService.getAllProducts(
        user,
        {
          pageSize: 1000,
          pageSkip: 0,
          isWebAvailable: true,
          isDiscontinued: false,
          includeEmptyGTINs: true,
          includeStockQuantity: true,
          includePricelists: true,
          includeAlternativeIdentifiers: true,
        },
      );
      const { existingSkus, duplicatedProducts } = await this.checkDuplicates(
        frontProducts,
        wooCommerceCredentials,
      );

      const { importedProducts, skippedProducts } = await this.processProducts(
        frontProducts,
        existingSkus,
        formatConfig,
        wooCommerceCredentials,
        userId,
        user.Orgnum,
      );

      await this.createImportRecord(
        userId,
        user.Orgnum,
        frontProducts.length,
        importedProducts,
        skippedProducts,
        duplicatedProducts,
        startTime,
      );

      return {
        imported: importedProducts,
        skipped: skippedProducts,
        duplicated: duplicatedProducts,
      };
    } catch (error) {
      this.logger.error('Error in importProducts:', error);
      if (error instanceof ImportException) {
        throw error;
      }
      throw new ImportException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private validateAndGetWooCommerceCredentials(
    user: User,
  ): WooCommerceCredentials {
    const { wooCommerce } = user.apiKeys;
    if (!wooCommerce?.consumerKey || !wooCommerce?.consumerSecret) {
      throw new InvalidCredentialsException();
    }

    const rawUrl = wooCommerce?.url || process.env.WOOCOMMERCE_API_URL;
    if (!rawUrl) {
      throw new InvalidCredentialsException(
        'URL de WooCommerce no configurada',
      );
    }

    return {
      consumerKey: wooCommerce.consumerKey,
      consumerSecret: wooCommerce.consumerSecret,
      url: TextUtils.formatWooCommerceUrl(rawUrl),
    };
  }

  private async checkDuplicates(
    frontProducts: FSProductResponseDto[],
    credentials: WooCommerceCredentials,
  ): Promise<{
    existingSkus: Set<string>;
    duplicatedProducts: { id: string; name: string }[];
  }> {
    try {
      const productSkus = frontProducts.map((p) => p.productid.toString());
      const existingProducts = await this.wcProductService.getProductsBySkus(
        productSkus,
        credentials,
      );
      const existingSkus = new Set(existingProducts.map((p) => p.sku));
      const duplicatedProducts = frontProducts
        .filter((product) => existingSkus.has(product.productid.toString()))
        .map((product) => ({
          id: product.productid.toString(),
          name: product.name,
        }));

      return { existingSkus, duplicatedProducts };
    } catch (error) {
      throw new ImportException('Error verificando duplicados', undefined, {
        error,
      });
    }
  }

  private async processProducts(
    frontProducts: FSProductResponseDto[],
    existingSkus: Set<string>,
    formatConfig: ProductFormatConfig,
    credentials: WooCommerceCredentials,
    userId: string,
    companyId: string,
  ): Promise<{
    importedProducts: WCProductDTO[];
    skippedProducts: { id: string; name: string; reason: string }[];
  }> {
    const importedProducts: WCProductDTO[] = [];
    const skippedProducts: { id: string; name: string; reason: string }[] = [];
    const batchSize = 10;

    const productsToProcess = frontProducts.filter((product) => {
      const sku = product.productid.toString();
      const hasValidGTIN = product.productSizes.some(
        (size) => size.gtin && size.gtin.trim() !== '',
      );

      if (!hasValidGTIN) {
        skippedProducts.push({
          id: sku,
          name: product.name,
          reason: 'Sin GTIN',
        });
        this.logger.warn(
          `Producto no importado - Sin GTIN: ID ${sku}, Nombre: ${product.name}`,
        );
        return false;
      }

      if (existingSkus.has(sku)) {
        skippedProducts.push({
          id: sku,
          name: product.name,
          reason: 'Producto duplicado',
        });
        return false;
      }

      return true;
    });

    for (let i = 0; i < productsToProcess.length; i += batchSize) {
      const batch = productsToProcess.slice(i, i + batchSize);
      const batchPromises = batch.map(async (product) => {
        try {
          const productMapperDependencies = {
            getOrCreateCategory: this.getOrCreateCategory.bind(this),
            getOrCreateAttribute: this.getOrCreateAttribute.bind(this),
            processImages: (images: string[]) =>
              ImageUtils.processImages(images, this.cloudinaryService),
            createProductVariation:
              this.wcProductService.createProductVariation.bind(
                this.wcProductService,
              ),
            createProduct: this.wcProductService.createProduct.bind(
              this.wcProductService,
            ),
          };

          const createdProduct = await this.productMapper.mapAndCreateProduct(
            product,
            formatConfig,
            credentials,
            productMapperDependencies,
          );

          try {
            await this.saveWCProduct(createdProduct, userId, companyId);
            importedProducts.push(createdProduct);
            this.logger.debug(
              `Successfully imported and saved product: ${createdProduct.name} (${createdProduct.sku})`,
            );
          } catch (mongoError) {
            this.logger.error(
              `MongoDB save error for product ${product.productid}:`,
              mongoError,
            );
            throw new DatabaseOperationException('saveWCProduct', {
              productId: product.productid,
              error: mongoError,
            });
          }
        } catch (error) {
          this.logger.error(
            `Error processing product ${product.productid}:`,
            error,
          );
          if (error instanceof ImportException) {
            throw error;
          }
          throw new ProductProcessingException(
            product.productid.toString(),
            error instanceof Error ? error.message : String(error),
          );
        }
      });

      await Promise.all(batchPromises);
    }

    return { importedProducts, skippedProducts };
  }

  private async saveWCProduct(
    product: WCProductDTO,
    userId: string,
    companyId: string,
  ): Promise<void> {
    try {
      this.logger.debug('Saving WC product to MongoDB:', {
        wcId: product.id,
        sku: product.sku,
        name: product.name,
      });

      await this.wcProductRepository.create({
        userId,
        companyId,
        wcId: product.id,
        sku: product.sku,
        name: product.name,
        type: product.type,
        description: product.description,
        shortDescription: product.short_description,
        categories: product.categories,
        images: product.images,
        tags: product.tags,
        attributes: product.attributes,
        metaData: product.meta_data,
        status: product.status,
        price: product.regular_price,
        importedAt: new Date(),
      });

      this.logger.debug('WC product saved successfully');
    } catch (error) {
      this.logger.error('Error saving WC product to MongoDB:', error);
      throw new DatabaseOperationException('saveWCProduct', {
        productId: product.id,
        sku: product.sku,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  private async createImportRecord(
    userId: string,
    companyId: string,
    totalProducts: number,
    importedProducts: WCProductDTO[],
    skippedProducts: { id: string; name: string; reason: string }[],
    duplicatedProducts: { id: string; name: string }[],
    startTime: Date,
  ): Promise<void> {
    if (importedProducts.length > 0) {
      const endTime = new Date();
      const status =
        skippedProducts.length === totalProducts
          ? 'error'
          : skippedProducts.length > 0
            ? 'partial'
            : 'success';

      try {
        const record = await this.importRecordRepository.create({
          userId,
          companyId,
          totalProducts,
          importedProducts: importedProducts.length,
          skippedProducts: skippedProducts.length,
          duplicatedProducts: duplicatedProducts.length,
          skippedDetails: skippedProducts,
          duplicatedDetails: duplicatedProducts,
          importedDetails: importedProducts.map((p) => ({
            id: p.sku,
            name: p.name,
          })),
          startTime,
          endTime,
          status,
        });

        this.logger.debug('Import record created successfully:', record);
      } catch (error) {
        this.logger.error('Error creating import record:', error);
        throw new DatabaseOperationException('createImportRecord', {
          userId,
          companyId,
          error: error instanceof Error ? error.message : error,
        });
      }
    }
  }

  private async getOrCreateCategory(
    name: string,
    slug: string,
    parentId?: number,
    credentials?: WooCommerceCredentials,
  ): Promise<any> {
    try {
      const cachedCategory = CacheUtils.getCategory(slug, parentId);
      if (cachedCategory) {
        return cachedCategory;
      }

      const category = await this.wcProductService.createOrGetCategory(
        name,
        slug,
        parentId,
        credentials,
      );
      CacheUtils.setCategory(slug, parentId, category);
      return category;
    } catch (error) {
      throw new ImportException(
        'Error creando/obteniendo categoría',
        undefined,
        {
          name,
          slug,
          parentId,
          error: error instanceof Error ? error.message : error,
        },
      );
    }
  }

  private async getOrCreateAttribute(
    attributeData: any,
    credentials?: WooCommerceCredentials,
  ): Promise<any> {
    try {
      const cachedAttribute = CacheUtils.getAttribute(attributeData.slug);
      if (cachedAttribute) {
        return cachedAttribute;
      }

      const attribute = await this.wcProductService.createAttribute(
        attributeData,
        credentials,
      );
      CacheUtils.setAttribute(attributeData.slug, attribute);
      return attribute;
    } catch (error) {
      throw new ImportException(
        'Error creando/obteniendo atributo',
        undefined,
        {
          attributeData,
          error: error instanceof Error ? error.message : error,
        },
      );
    }
  }
}
