import { Injectable, Logger } from '@nestjs/common';
import { FSProductResponseDto } from '@/modules/front-systems/product/application/dto/response/product.dto';
import { WCProductDTO } from '@/modules/woocommerce/product/application/dto';
import { ProductFormatConfig } from '../dto/format-config.dto';
import { WooCommerceCredentials } from '@/modules/woocommerce/product/application/dto/woocommerce-credentials.dto';
import { ProductMapper } from '../mappers/product.mapper';
import { ImageUtils } from '../utils/image.utils';
import { CloudinaryService } from '@/modules/woocommerce/product/application/service/cloudinary.service';
import { WCProductService } from '@/modules/woocommerce/product/application/service/product.service';
import { FSProductService } from '@/modules/front-systems/product/application/service/product.service';
import { User } from '../interface/user.interface';
import { WCProductRepository } from '../../infrastructure/persistence/wc-product.repository';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  private categoryCache: Map<string, any> = new Map();
  private attributeCache: Map<string, any> = new Map();

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly wcProductService: WCProductService,
    private readonly productMapper: ProductMapper,
    private readonly fsProductService: FSProductService,
    private readonly wcProductRepository: WCProductRepository,
  ) {}

  async getAllProducts(user: User): Promise<FSProductResponseDto[]> {
    const productFilter = {
      pageSize: 1000,
      pageSkip: 0,
      isWebAvailable: true,
      isDiscontinued: false,
      includeEmptyGTINs: true,
      includeStockQuantity: true,
      includePricelists: true,
      includeAlternativeIdentifiers: true,
    };

    return await this.fsProductService.getAllProducts(user, productFilter);
  }

  // Método para guardar productos en MongoDB
  async saveProduct(
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

      const existingProduct = await this.wcProductRepository.findBySku(
        product.sku,
      );

      const productData = {
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
      };

      if (existingProduct) {
        this.logger.debug(
          'Producto ya existe en la base de datos, actualizando información:',
          {
            sku: product.sku,
            name: product.name,
            wcIdAnterior: existingProduct.wcId,
            wcIdNuevo: product.id,
            fechaImportacionAnterior: existingProduct.importedAt,
            fechaActualizacion: new Date(),
          },
        );
        await this.wcProductRepository.update(
          existingProduct._id.toString(),
          productData,
        );
        this.logger.debug('WC product updated successfully');
      } else {
        await this.wcProductRepository.create(productData);
        this.logger.debug('WC product created successfully');
      }
    } catch (error) {
      this.logger.error('Error saving WC product to MongoDB:', error);
      throw new Error(
        `Failed to save product ${product.name} (${product.sku}) to MongoDB: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  // Métodos de caché
  async getOrCreateCategory(
    name: string,
    slug: string,
    parentId?: number,
    credentials?: WooCommerceCredentials,
  ): Promise<any> {
    const cacheKey = `${slug}-${parentId || ''}`;
    if (this.categoryCache.has(cacheKey)) {
      return this.categoryCache.get(cacheKey);
    }

    const category = await this.wcProductService.createOrGetCategory(
      name,
      slug,
      parentId,
      credentials,
    );
    this.categoryCache.set(cacheKey, category);
    return category;
  }

  async getOrCreateAttribute(
    attributeData: any,
    credentials?: WooCommerceCredentials,
  ): Promise<any> {
    if (this.attributeCache.has(attributeData.slug)) {
      return this.attributeCache.get(attributeData.slug);
    }

    const attribute = await this.wcProductService.createAttribute(
      attributeData,
      credentials,
    );
    this.attributeCache.set(attributeData.slug, attribute);
    return attribute;
  }

  // Método de verificación de duplicados
  async checkDuplicates(
    frontProducts: FSProductResponseDto[],
    credentials: WooCommerceCredentials,
  ): Promise<{
    existingSkus: Set<string>;
    duplicatedProducts: { id: string; name: string }[];
  }> {
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
  }

  // Método principal de procesamiento
  async processProducts(
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
    const batchSize = 20;
    const startTime = Date.now();

    this.logger.debug('Iniciando procesamiento de productos', {
      totalProducts: frontProducts.length,
      existingSkusCount: existingSkus.size,
      batchSize,
      formatConfig,
      credentials: {
        url: credentials.url,
        consumerKey: credentials.consumerKey ? '***' : undefined,
        consumerSecret: credentials.consumerSecret ? '***' : undefined,
      },
    });

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
        this.logger.warn(
          `Producto no importado - Duplicado: ID ${sku}, Nombre: ${product.name}`,
        );
        return false;
      }

      return true;
    });

    this.logger.debug(
      `Productos a procesar: ${productsToProcess.length} de ${frontProducts.length}`,
    );

    for (let i = 0; i < productsToProcess.length; i += batchSize) {
      const batchStartTime = Date.now();
      const batch = productsToProcess.slice(i, i + batchSize);
      this.logger.debug(
        `Procesando lote ${Math.floor(i / batchSize) + 1} de ${Math.ceil(productsToProcess.length / batchSize)}`,
        {
          batchSize: batch.length,
          totalProcessed: i,
          remainingProducts: productsToProcess.length - i,
        },
      );

      const batchPromises = batch.map(async (product) => {
        try {
          this.logger.debug(
            `Iniciando procesamiento del producto ${product.productid}`,
            {
              name: product.name,
              sku: product.productid,
              brand: product.brand,
              color: product.color,
              groupName: product.groupName,
            },
          );

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

          this.logger.debug(
            `Producto creado en WooCommerce: ${createdProduct.id}`,
            {
              name: createdProduct.name,
              sku: createdProduct.sku,
              type: createdProduct.type,
            },
          );

          try {
            await this.saveProduct(createdProduct, userId, companyId);
            importedProducts.push(createdProduct);
            this.logger.debug(
              `Producto importado y guardado exitosamente: ${createdProduct.name} (${createdProduct.sku})`,
            );
          } catch (mongoError) {
            this.logger.error(
              `Error al guardar en MongoDB el producto ${product.productid}:`,
              mongoError,
            );
            skippedProducts.push({
              id: product.productid.toString(),
              name: product.name,
              reason: `Error al guardar en MongoDB: ${mongoError instanceof Error ? mongoError.message : mongoError}`,
            });
          }
        } catch (error) {
          this.logger.error(`Error procesando producto ${product.productid}:`, {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : error,
            product: {
              id: product.productid,
              name: product.name,
              sku: product.productid,
              brand: product.brand,
              color: product.color,
              groupName: product.groupName,
            },
          });
          skippedProducts.push({
            id: product.productid.toString(),
            name: product.name,
            reason: error instanceof Error ? error.message : String(error),
          });
        }
      });

      await Promise.all(batchPromises);

      const batchEndTime = Date.now();
      this.logger.debug(`Lote completado`, {
        batchNumber: Math.floor(i / batchSize) + 1,
        batchDuration: `${(batchEndTime - batchStartTime) / 1000}s`,
        productsInBatch: batch.length,
      });
    }

    const endTime = Date.now();
    this.logger.debug('Procesamiento de productos completado', {
      imported: importedProducts.length,
      skipped: skippedProducts.length,
      totalDuration: `${(endTime - startTime) / 1000}s`,
      averageTimePerProduct: `${(endTime - startTime) / frontProducts.length / 1000}s`,
    });

    return { importedProducts, skippedProducts };
  }
}
