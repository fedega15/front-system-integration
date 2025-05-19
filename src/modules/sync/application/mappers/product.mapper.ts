import { FSProductResponseDto } from '@/modules/front-systems/product/application/dto/response/product.dto';
import { WCProductDTO } from '@/modules/woocommerce/product/application/dto';
import { ProductFormatConfig } from '../dto/format-config.dto';
import { WooCommerceCredentials } from '@/modules/woocommerce/product/application/dto/woocommerce-credentials.dto';
import { IImage } from '@/modules/woocommerce/product/application/interface/product.interface';
import { ProductError } from '@/modules/woocommerce/product/application/exceptions/product.exceptions';
import { TextUtils } from '../utils/text.utils';
import { Logger, Injectable } from '@nestjs/common';
import { WCProductService } from '@/modules/woocommerce/product/application/service/product.service';

const CATEGORY_MAN = 'Man';
const CATEGORY_WOMAN = 'Woman';
const SLUG_MAN = 'man-category';
const SLUG_WOMAN = 'woman-category';

export interface ProductMapperDependencies {
  getOrCreateCategory: (
    name: string,
    slug: string,
    parentId?: number,
    credentials?: WooCommerceCredentials,
  ) => Promise<any>;
  getOrCreateAttribute: (
    attributeData: any,
    credentials?: WooCommerceCredentials,
  ) => Promise<any>;
  processImages: (images: string[]) => Promise<IImage[]>;
  createProductVariation: (
    productId: number,
    variationData: any,
    credentials?: WooCommerceCredentials,
  ) => Promise<void>;
  createProduct: (
    productData: any,
    credentials?: WooCommerceCredentials,
  ) => Promise<WCProductDTO>;
}

@Injectable()
export class ProductMapper {
  private readonly logger = new Logger(ProductMapper.name);
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000; // 2 segundos

  constructor(private readonly wcProductService: WCProductService) {}

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async mapAndCreateProduct(
    frontProduct: FSProductResponseDto,
    formatConfig: ProductFormatConfig,
    credentials: WooCommerceCredentials,
    dependencies: ProductMapperDependencies,
  ): Promise<WCProductDTO> {
    try {
      this.logger.debug('Iniciando mapeo y creación de producto', {
        productId: frontProduct.productid,
        name: frontProduct.name,
        imagesCount: frontProduct.images?.length || 0,
      });

      // Validar datos requeridos
      if (!frontProduct.name || !frontProduct.productid) {
        throw new ProductError('Nombre e ID del producto son requeridos');
      }

      if (!frontProduct.price || isNaN(Number(frontProduct.price))) {
        throw new ProductError(`Precio inválido: ${frontProduct.price}`);
      }

      // Validar que el producto tenga tamaños
      if (
        !frontProduct.productSizes ||
        frontProduct.productSizes.length === 0
      ) {
        throw new ProductError('El producto no tiene tamaños definidos');
      }

      const [manCategory, womanCategory] = await Promise.all([
        dependencies.getOrCreateCategory(
          'Man',
          'man-category',
          undefined,
          credentials,
        ),
        dependencies.getOrCreateCategory(
          'Woman',
          'woman-category',
          undefined,
          credentials,
        ),
      ]);

      this.logger.debug('Categorías base creadas/obtenidas', {
        manCategory: manCategory?.id,
        womanCategory: womanCategory?.id,
      });

      const categorySlug =
        TextUtils.formatSlug(frontProduct.groupName) + '-category';
      const genders = this.parseGenders(frontProduct.gender);

      this.logger.debug('Información de categoría y género', {
        categorySlug,
        genders,
      });

      const productCategory = await dependencies.getOrCreateCategory(
        frontProduct.groupName,
        categorySlug,
        undefined,
        credentials,
      );

      this.logger.debug('Categoría del producto creada/obtenida', {
        categoryId: productCategory?.id,
        categoryName: productCategory?.name,
      });

      const allCategories = this.buildCategories(
        productCategory,
        manCategory,
        womanCategory,
        genders,
      );

      this.logger.debug('Categorías finales', {
        count: allCategories.length,
        categories: allCategories.map((c) => ({ id: c.id, name: c.name })),
      });

      await this.createAttributes(dependencies, credentials);

      const [validImages, productSizes] = await this.processProductData(
        frontProduct,
        dependencies,
        formatConfig,
      );

      this.logger.debug('Datos de producto procesados', {
        imagesCount: validImages.length,
        sizesCount: productSizes.length,
        sizes: productSizes.map((s) => s.label),
        images: validImages.map((img) => img.src),
      });

      const productData = this.buildProductData(
        frontProduct,
        formatConfig,
        validImages,
        productSizes,
        allCategories,
        genders,
      );

      this.logger.debug('Datos del producto construidos', {
        name: productData.name,
        sku: productData.sku,
        type: productData.type,
        categories: productData.categories?.length,
        attributes: productData.attributes?.map((a) => ({
          name: a.name,
          visible: a.visible,
          variation: a.variation,
          options: a.options,
        })),
        images: productData.images?.map((img) => img.src),
      });

      // Intentar crear/actualizar el producto con reintentos
      let lastError;
      let createdProduct;

      for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
        try {
          // Paso 1: Crear el producto principal
          createdProduct = await this.wcProductService.createProduct(
            productData,
            credentials,
          );

          this.logger.debug('Producto creado/actualizado exitosamente', {
            id: createdProduct.id,
            sku: createdProduct.sku,
            type: createdProduct.type,
            status: createdProduct.status,
          });

          // Esperar un momento para que WooCommerce procese el producto
          await this.delay(3000);

          // Paso 2: Verificar que el producto se haya creado como tipo variable
          if (createdProduct && createdProduct.id) {
            if (createdProduct.type !== 'variable') {
              this.logger.warn(
                `El producto no se creó como tipo variable: ${createdProduct.type}. Actualizando...`,
              );

              // Actualizar el tipo de producto si no se creó como variable
              const updateData = {
                id: createdProduct.id,
                type: 'variable',
              };

              await this.wcProductService.createProduct(
                updateData,
                credentials,
              );
              await this.delay(2000);
            }

            // Paso 3: Crear variaciones una por una
            if (productSizes.length > 0) {
              this.logger.debug(
                `Procediendo a crear ${productSizes.length} variaciones para el producto ${createdProduct.id}`,
              );
              await this.createVariations(
                createdProduct.id,
                productSizes,
                frontProduct,
                dependencies,
                credentials,
              );
            } else {
              this.logger.warn(
                `No se crearán variaciones para el producto ${createdProduct.id}`,
                {
                  reason: 'No hay tamaños disponibles',
                },
              );
            }
          } else {
            throw new ProductError(
              'No se pudo obtener el ID del producto creado',
            );
          }

          break; // Salir del bucle si la creación fue exitosa
        } catch (error) {
          lastError = error;
          this.logger.warn(
            `Intento ${attempt} fallido al crear/actualizar producto`,
            {
              sku: productData.sku,
              error: error instanceof Error ? error.message : error,
            },
          );

          if (attempt < this.MAX_RETRIES) {
            await this.delay(this.RETRY_DELAY * attempt); // Backoff exponencial
          }
        }
      }

      if (!createdProduct) {
        throw (
          lastError ||
          new ProductError(
            'No se pudo crear el producto después de varios intentos',
          )
        );
      }

      // Recargar el producto para obtener los datos actualizados incluyendo variaciones
      try {
        const updatedProduct = await this.wcProductService.retrieveProduct(
          createdProduct.id,
          credentials,
        );
        return updatedProduct;
      } catch (error) {
        this.logger.warn(
          `No se pudo recargar el producto después de crear variaciones: ${error instanceof Error ? error.message : error}`,
        );
        return createdProduct;
      }
    } catch (error) {
      this.logger.error(`Error mapeando producto ${frontProduct.productid}:`, {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : error,
        product: {
          id: frontProduct.productid,
          name: frontProduct.name,
          brand: frontProduct.brand,
          color: frontProduct.color,
          groupName: frontProduct.groupName,
        },
      });
      throw new ProductError(
        `Error mapping product: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  private parseGenders(gender: string): string[] {
    return gender.includes(',')
      ? gender
          .toLowerCase()
          .split(',')
          .map((g) => g.trim())
      : [gender.toLowerCase().trim()];
  }

  private buildCategories(
    productCategory: any,
    manCategory: any,
    womanCategory: any,
    genders: string[],
  ): any[] {
    const categories = [productCategory];
    if (genders.includes('m')) categories.push(manCategory);
    if (genders.includes('f')) categories.push(womanCategory);
    return categories;
  }

  private async createAttributes(
    dependencies: ProductMapperDependencies,
    credentials: WooCommerceCredentials,
  ): Promise<void> {
    try {
      this.logger.debug('Creando/verificando atributos base');

      const attributePromises = [
        dependencies.getOrCreateAttribute(
          {
            name: 'Size',
            slug: 'size',
            type: 'select',
            order_by: 'menu_order',
            has_archives: true,
          },
          credentials,
        ),
        dependencies.getOrCreateAttribute(
          {
            name: 'Color',
            slug: 'color',
            type: 'select',
            order_by: 'menu_order',
            has_archives: true,
          },
          credentials,
        ),
        dependencies.getOrCreateAttribute(
          {
            name: 'Brand',
            slug: 'brand',
            type: 'select',
            has_archives: true,
          },
          credentials,
        ),
        dependencies.getOrCreateAttribute(
          {
            name: 'Group',
            slug: 'group',
            type: 'select',
            has_archives: true,
          },
          credentials,
        ),
        dependencies.getOrCreateAttribute(
          {
            name: 'Género',
            slug: 'genero',
            type: 'select',
            has_archives: true,
          },
          credentials,
        ),
      ];

      const results = await Promise.all(attributePromises);
      this.logger.debug('Atributos base creados/verificados exitosamente', {
        attributes: results.map((attr) => attr.name || attr.slug),
      });
    } catch (error) {
      this.logger.error('Error al crear atributos base', {
        error: error instanceof Error ? error.message : error,
      });
      // No lanzamos el error para permitir que el proceso continúe
      // ya que WooCommerce podría ya tener los atributos creados
    }
  }

  private async processProductData(
    frontProduct: FSProductResponseDto,
    dependencies: ProductMapperDependencies,
    formatConfig: ProductFormatConfig,
  ): Promise<[any[], any[]]> {
    const startTime = Date.now();

    // Procesar imágenes
    const validImages = await dependencies.processImages(frontProduct.images);

    // Procesar tamaños y calcular stock
    this.logger.debug(
      `Procesando ${frontProduct.productSizes.length} tamaños para el producto ${frontProduct.productid}`,
      {
        sizes: frontProduct.productSizes.map((s) => s.label),
      },
    );

    // Mapear tamaños y calcular stock total para cada uno
    const productSizes = frontProduct.productSizes.map((size) => {
      // Calcular stock total para este tamaño
      let totalStockQty = 0;
      if (Array.isArray(size.stockQty)) {
        totalStockQty = size.stockQty.reduce(
          (acc, stock) => acc + stock.qty,
          0,
        );
      }

      // Asegurar que siempre haya al menos 1 de stock para que aparezca como disponible
      // Guardamos el stock original para referencia
      const originalStockQty = totalStockQty;
      const adjustedStockQty = Math.max(1, totalStockQty);

      // Extraer campos adicionales que pueden estar en el objeto
      const { externalSKU, pricelists, labelSortIndex } = size as any;

      return {
        identity: size.identity,
        gtin: size.gtin,
        label: size.label,
        // Añadir campos calculados
        stockQty: adjustedStockQty, // Stock ajustado (mínimo 1)
        originalStockQty, // Stock original sin ajustar
        stockQtyDetails: size.stockQty, // Mantener los detalles originales
        identifiers: size.identifiers || [],
        // Añadir campos adicionales si existen
        externalSKU,
        pricelists,
        labelSortIndex,
      };
    });

    this.logger.debug('Stock calculado para cada tamaño', {
      productId: frontProduct.productid,
      sizes: productSizes.map((s) => ({
        label: s.label,
        stockQty: s.stockQty,
        originalStockQty: s.originalStockQty,
        // Usar operador opcional para evitar errores si la propiedad no existe
        externalSKU: (s as any).externalSKU,
        pricelists: (s as any).pricelists,
        labelSortIndex: (s as any).labelSortIndex,
      })),
    });

    const filteredSizes = this.filterProductSizes(productSizes, formatConfig);
    if (filteredSizes.length === 0) {
      throw new ProductError('No valid sizes available after filtering');
    }

    const endTime = Date.now();
    this.logger.debug('Procesamiento de datos completado', {
      productId: frontProduct.productid,
      imagesProcessed: validImages.length,
      sizesProcessed: filteredSizes.length,
      duration: `${(endTime - startTime) / 1000}s`,
    });

    return [validImages, filteredSizes];
  }

  private filterProductSizes(
    sizes: any[],
    formatConfig: ProductFormatConfig,
  ): any[] {
    return sizes.filter((size) => {
      if (
        formatConfig.filters?.excludeSizesWithoutGTIN &&
        (!size.gtin || size.gtin.trim() === '')
      ) {
        this.logger.debug(`Talla ${size.label} filtrada por no tener GTIN`);
        return false;
      }

      // Comentamos esta parte para no filtrar por stock
      // Si hay filtro por stock, ignorarlo para permitir todas las tallas
      /*
      if (formatConfig.filters?.excludeSizesNotInStock && size.stockQty <= 0) {
        this.logger.debug(`Talla ${size.label} filtrada por no tener stock (${size.stockQty})`);
        return false;
      }
      */

      return true;
    });
  }

  private buildProductData(
    frontProduct: FSProductResponseDto,
    formatConfig: ProductFormatConfig,
    validImages: any[],
    productSizes: any[],
    categories: any[],
    genders: string[],
  ): any {
    const formattedName = TextUtils.formatText(formatConfig.nameFormat, {
      name: frontProduct.name,
      brand: frontProduct.brand,
      color: frontProduct.color,
      variant: frontProduct.variant,
      group: frontProduct.groupName,
      subgroup: frontProduct.subgroupName,
    });

    const formattedDescription = TextUtils.formatText(
      formatConfig.descriptionFormat,
      {
        description: frontProduct.description,
        name: frontProduct.name,
        brand: frontProduct.brand,
        color: frontProduct.color,
        variant: frontProduct.variant,
        group: frontProduct.groupName,
        subgroup: frontProduct.subgroupName,
      },
    );

    const tags = this.generateTags(frontProduct, formatConfig);
    const attributes = this.buildAttributes(
      frontProduct,
      productSizes,
      formatConfig,
      genders,
    );

    const price = frontProduct.price ? frontProduct.price.toString() : '0';

    // Calcular stock total sumando el stock de todas las tallas
    const totalStock = productSizes.reduce(
      (sum, size) => sum + (size.stockQty || 0),
      0,
    );

    this.logger.debug('Construyendo datos del producto', {
      name: formattedName,
      sku: frontProduct.productid,
      price: price,
      categories: categories.length,
      attributes: attributes.length,
      images: validImages.length,
      totalStock: totalStock,
    });

    // Preparar atributos por defecto - crucial para que se muestren los selectores
    const defaultAttributes = [];

    if (productSizes.length > 0) {
      defaultAttributes.push({
        name: 'Size',
        option: String(productSizes[0].label),
      });
    }

    // Añadir color como atributo por defecto
    const colorValue =
      frontProduct.color && frontProduct.color.trim() !== ''
        ? frontProduct.color
        : 'Default';
    defaultAttributes.push({
      name: 'Color',
      option: colorValue,
    });

    return {
      name: formattedName,
      sku: frontProduct.productid.toString(),
      type: 'variable',
      status: 'publish',
      featured: false,
      catalog_visibility: 'visible',
      regular_price: price,
      description: formattedDescription,
      short_description: formattedDescription,
      categories,
      images: validImages,
      tags,
      tax_status: 'none',
      tax_class: '',
      attributes,
      slug: TextUtils.formatSlug(formattedName) + '-' + frontProduct.productid,
      meta_data: this.buildMetaData(productSizes),
      // Configuración de stock
      manage_stock: true,
      stock_quantity: totalStock, // Asignar el stock total calculado
      sold_individually: false,
      backorders: 'no',
      backorders_allowed: false,
      stock_status: 'instock', // Forzar estado "en stock"
      default_attributes: defaultAttributes,
    };
  }

  private generateTags(
    product: FSProductResponseDto,
    formatConfig: ProductFormatConfig,
  ): { name: string }[] {
    const tags: { name: string }[] = [];

    if (formatConfig.tags.color && product.color)
      tags.push({ name: product.color });
    if (formatConfig.tags.season && product.season)
      tags.push({ name: product.season });
    if (formatConfig.tags.vendor && product.brand)
      tags.push({ name: product.brand });
    if (formatConfig.tags.productId)
      tags.push({ name: `ID:${product.productid}` });
    if (formatConfig.tags.productNumber && product.number)
      tags.push({ name: `No:${product.number}` });
    if (formatConfig.tags.productVariant && product.variant)
      tags.push({ name: product.variant });
    if (formatConfig.tags.group && product.groupName)
      tags.push({ name: product.groupName });
    if (formatConfig.tags.subgroup && product.subgroupName)
      tags.push({ name: product.subgroupName });

    const genders = product.gender
      .toLowerCase()
      .split(',')
      .map((g) => g.trim());
    if (formatConfig.genderTags.woman && genders.includes('f'))
      tags.push({ name: 'Woman' });
    if (formatConfig.genderTags.man && genders.includes('m'))
      tags.push({ name: 'Man' });
    if (formatConfig.genderTags.unisex && genders.length > 1)
      tags.push({ name: 'Unisex' });

    return tags;
  }

  private buildAttributes(
    frontProduct: FSProductResponseDto,
    productSizes: any[],
    formatConfig: ProductFormatConfig,
    genders: string[],
  ): any[] {
    const attributes = [];

    // Verificar que tenemos tamaños
    if (productSizes.length === 0) {
      this.logger.warn('No hay tamaños disponibles para el producto', {
        productId: frontProduct.productid,
        name: frontProduct.name,
      });
      return attributes;
    }

    // Asegurar que cada talla sea una cadena
    const sizeOptions = productSizes.map((size) => String(size.label));

    this.logger.debug('Opciones de tamaño para variaciones', {
      productId: frontProduct.productid,
      sizeOptions,
    });

    // Atributo de tamaño - para variaciones
    attributes.push({
      id: 0, // Se asignará automáticamente
      name: 'Size',
      position: 0,
      visible: true,
      variation: true,
      options: sizeOptions,
    });

    // Atributo de color - AHORA TAMBIÉN para variaciones
    const colorValue =
      frontProduct.color && frontProduct.color.trim() !== ''
        ? frontProduct.color
        : 'Default';

    this.logger.debug('Color para variación', {
      productId: frontProduct.productid,
      color: colorValue,
    });

    attributes.push({
      id: 0, // Se asignará automáticamente
      name: 'Color',
      position: 1,
      visible: true,
      variation: true, // Ahora es un atributo de variación
      options: [colorValue],
    });

    // Añadir marca como atributo visible pero NO de variación
    if (frontProduct.brand && frontProduct.brand.trim() !== '') {
      attributes.push({
        id: 0, // Se asignará automáticamente
        name: 'Brand',
        position: 2,
        visible: true,
        variation: false,
        options: [frontProduct.brand],
      });
    }

    // Añadir género como atributo visible pero NO de variación
    if (genders.length > 0) {
      attributes.push({
        id: 0, // Se asignará automáticamente
        name: 'Género',
        position: 3,
        visible: true,
        variation: false,
        options: genders.map((g) => (g === 'm' ? 'Man' : 'Woman')),
      });
    }

    // Añadir grupo como atributo visible pero NO de variación
    if (frontProduct.groupName && frontProduct.groupName.trim() !== '') {
      attributes.push({
        id: 0, // Se asignará automáticamente
        name: 'Group',
        position: 4,
        visible: true,
        variation: false,
        options: [frontProduct.groupName],
      });
    }

    return attributes;
  }

  private buildMetaData(productSizes: any[]): any[] {
    const metadata = [];

    // Guardar información completa de cada talla
    productSizes.forEach((size) => {
      metadata.push({
        key: `size_${size.label}`,
        value: JSON.stringify({
          identity: size.identity,
          gtin: size.gtin,
          label: size.label,
          stockQty: size.stockQtyDetails || [], // Array con desglose de stock por stockId
          externalSKU: size.externalSKU || null,
          totalStock: size.stockQty, // El stock ajustado (mínimo 1)
          originalStock: size.originalStockQty || 0, // El stock original sin ajustar
          pricelists: size.pricelists || null,
          labelSortIndex: size.labelSortIndex || '0,0',
          identifiers: size.identifiers || [],
        }),
      });
    });

    // Añadir un metadato resumen con todas las tallas para facilitar las consultas
    metadata.push({
      key: 'product_sizes_summary',
      value: JSON.stringify(
        productSizes.map((size) => ({
          label: size.label,
          identity: size.identity,
          gtin: size.gtin,
          totalStock: size.stockQty, // Stock ajustado
          originalStock: size.originalStockQty || 0, // Stock original
          externalSKU: size.externalSKU || null,
        })),
      ),
    });

    // Guardar la suma total del stock real
    const totalOriginalStock = productSizes.reduce(
      (sum, size) => sum + (size.originalStockQty || 0),
      0,
    );

    // Guardar la suma total del stock ajustado
    const totalAdjustedStock = productSizes.reduce(
      (sum, size) => sum + (size.stockQty || 0),
      0,
    );

    metadata.push({
      key: 'product_stock_summary',
      value: JSON.stringify({
        totalOriginalStock,
        totalAdjustedStock,
        sizesCount: productSizes.length,
      }),
    });

    return metadata;
  }

  private async createVariations(
    productId: number,
    productSizes: any[],
    frontProduct: FSProductResponseDto,
    dependencies: ProductMapperDependencies,
    credentials: WooCommerceCredentials,
  ): Promise<void> {
    const startTime = Date.now();

    this.logger.debug(
      `Iniciando creación de variaciones para el producto ID: ${productId}`,
      {
        productId,
        totalSizes: productSizes.length,
        sizes: productSizes.map((s) => s.label),
        color: frontProduct.color || 'Default',
      },
    );

    // Esperar un momento después de la creación del producto antes de crear variaciones
    await this.delay(2000);

    // Obtener el color para las variaciones
    const colorValue =
      frontProduct.color && frontProduct.color.trim() !== ''
        ? frontProduct.color
        : 'Default';

    // Crear variaciones secuencialmente, no en paralelo
    for (let i = 0; i < productSizes.length; i++) {
      const size = productSizes[i];

      // Asegurar que stockQty sea al menos 1 si es 0 o menor
      // Esto es para que las variaciones siempre aparezcan en stock
      const stockQty = Math.max(1, size.stockQty || 0);

      this.logger.debug(
        `Creando variación ${i + 1}/${productSizes.length} para talla ${size.label} y color ${colorValue}`,
        {
          sku: `${frontProduct.productid}-${size.label}`,
          stockQty,
          originalStock: size.stockQty,
          externalSKU: (size as any).externalSKU,
        },
      );

      // Construir metadatos detallados para la variación
      const metaData = [
        {
          key: 'gtin',
          value: size.gtin,
        },
        {
          key: 'identity',
          value: size.identity,
        },
        {
          key: 'color',
          value: colorValue,
        },
      ];

      // Añadir metadatos adicionales si existen
      if ((size as any).externalSKU) {
        metaData.push({
          key: 'external_sku',
          value: (size as any).externalSKU,
        });
      }

      if ((size as any).labelSortIndex) {
        metaData.push({
          key: 'label_sort_index',
          value: (size as any).labelSortIndex,
        });
      }

      // Añadir desglose completo del stock
      if (size.stockQtyDetails && Array.isArray(size.stockQtyDetails)) {
        metaData.push({
          key: 'stock_details',
          value: JSON.stringify(size.stockQtyDetails),
        });
      }

      // Añadir pricelist si existe
      if ((size as any).pricelists) {
        metaData.push({
          key: 'pricelists',
          value: JSON.stringify((size as any).pricelists),
        });
      }

      // Guardar el stock original para referencia
      metaData.push({
        key: 'original_stock',
        value: String(size.stockQty || 0),
      });

      const variationData = {
        regular_price: frontProduct.price.toString(),
        description: '',
        sku: `${frontProduct.productid}-${size.label}`,
        status: 'publish',
        manage_stock: true,
        stock_quantity: stockQty,
        stock_status: 'instock', // Siempre instock
        attributes: [
          {
            id: 0,
            name: 'Size',
            option: String(size.label),
          },
          {
            id: 0,
            name: 'Color',
            option: colorValue,
          },
        ],
        meta_data: metaData,
      };

      try {
        await dependencies.createProductVariation(
          productId,
          variationData,
          credentials,
        );
        this.logger.debug(
          `Variación para talla ${size.label} y color ${colorValue} creada exitosamente`,
        );
      } catch (error) {
        this.logger.error(
          `Error al crear variación para talla ${size.label} y color ${colorValue}`,
          {
            error: error instanceof Error ? error.message : error,
            sku: `${frontProduct.productid}-${size.label}`,
            stockQty,
          },
        );
        // Continuar con la siguiente variación en lugar de detener todo el proceso
        continue;
      }

      // Esperar un momento entre la creación de cada variación para no sobrecargar la API
      if (i < productSizes.length - 1) {
        await this.delay(1000);
      }
    }

    const endTime = Date.now();
    this.logger.debug('Proceso de creación de variaciones completado', {
      productId,
      variationsCount: productSizes.length,
      duration: `${(endTime - startTime) / 1000}s`,
    });
  }
}
