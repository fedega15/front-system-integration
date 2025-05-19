import { Injectable, Inject, forwardRef } from '@nestjs/common';
import {
  WCProductAttributeRequestDto,
  WCCreateProductRequestDTO,
  WCProductDTO,
  WCProductAttributeResponseDto,
  WCProductCategoryRequestDto,
  WCProductCategoryResponseDto,
  WCProductVariationRequestDto,
  WCProductVariationResponseDto,
} from '../dto';
import { WCProductAdapter } from '../../infrastructure/adapter/wc-product.adapter';
import { CloudinaryService } from './cloudinary.service';
import { FSProductService } from '@/modules/front-systems/product/application/service/product.service';
import { CategoryError, ProductError } from '../exceptions/product.exceptions';
import {
  WooCommerceBaseService,
  WooCommerceCredentials,
} from '@/modules/woocommerce/application/service/woocommerce-base.service';
import { IImage } from '../interface/product.interface';

@Injectable()
export class WCProductService extends WooCommerceBaseService {
  constructor(
    private readonly wcProductAdapter: WCProductAdapter,
    private readonly cloudinaryService: CloudinaryService,
    public readonly fsProductService: FSProductService,
  ) {
    super();
  }

  async getProducts(
    credentials: WooCommerceCredentials,
  ): Promise<WCProductDTO[]> {
    try {
      this.validateCredentials(credentials);
      return await this.wcProductAdapter.getProducts(credentials);
    } catch (error) {
      throw new ProductError(
        `Error al obtener productos: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async createProduct(
    productData: any,
    credentials: WooCommerceCredentials,
  ): Promise<WCProductDTO> {
    try {
      this.validateCredentials(credentials);
      const client = this.getWooCommerceClient(credentials);

      this.logger.debug('Creando producto en WooCommerce', {
        name: productData.name,
        sku: productData.sku,
        type: productData.type,
        categories: productData.categories?.length,
        attributes: productData.attributes?.length,
        images: productData.images?.length,
      });

      // Verificar si el producto ya existe
      try {
        const existingProduct = await this.getProductBySku(
          productData.sku,
          credentials,
        );
        if (existingProduct) {
          this.logger.debug('Producto ya existe, actualizando...', {
            id: existingProduct.id,
            sku: existingProduct.sku,
          });

          // Actualizar el producto existente
          const response = await client.put(
            `products/${existingProduct.id}`,
            productData,
          );
          return response.data;
        }
      } catch (error) {
        this.logger.debug('Producto no encontrado, creando nuevo...', {
          sku: productData.sku,
        });
      }

      // Si no existe, crear nuevo producto
      const response = await client.post('products', productData);
      return response.data;
    } catch (error) {
      this.logger.error('Error al crear producto en WooCommerce', {
        error: error instanceof Error ? error.message : error,
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status,
        productData: {
          name: productData.name,
          sku: productData.sku,
          type: productData.type,
          categories: productData.categories?.length,
          attributes: productData.attributes?.length,
          images: productData.images?.length,
        },
      });

      if ((error as any)?.response?.data) {
        throw new ProductError(
          `Error al crear el producto: ${error instanceof Error ? error.message : String(error)}. Detalles: ${JSON.stringify((error as any).response.data)}`,
        );
      }

      throw new ProductError(
        `Error al crear el producto: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async createAttribute(
    attributeData: any,
    credentials: WooCommerceCredentials,
  ): Promise<any> {
    try {
      this.validateCredentials(credentials);
      const client = this.getWooCommerceClient(credentials);

      // Primero verificar si el atributo ya existe
      const existingAttributes = await client.get('products/attributes', {
        params: { slug: attributeData.slug },
      });

      if (existingAttributes.data.length > 0) {
        return existingAttributes.data[0];
      }

      // Si no existe, crear nuevo atributo
      const response = await client.post('products/attributes', attributeData);
      return response.data;
    } catch (error) {
      throw new ProductError(
        `Error al crear atributo: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async createProductVariation(
    productId: number,
    variationData: any,
    credentials: WooCommerceCredentials,
  ): Promise<void> {
    try {
      this.validateCredentials(credentials);
      const client = this.getWooCommerceClient(credentials);

      await client.post(`products/${productId}/variations`, variationData);
    } catch (error) {
      throw new ProductError(
        `Error al crear la variación: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async createCategory(
    categoryData: WCProductCategoryRequestDto,
    credentials: WooCommerceCredentials,
  ): Promise<WCProductCategoryResponseDto> {
    return await this.wcProductAdapter.createCategory(
      categoryData,
      credentials,
    );
  }

  async getCategoryBySlug(
    slug: string,
    credentials: WooCommerceCredentials,
  ): Promise<WCProductCategoryResponseDto> {
    const categories = await this.wcProductAdapter.getCategories(credentials);
    const category = categories.find((cat) => cat.slug === slug);

    if (!category) {
      throw new Error(`Category with slug ${slug} not found`);
    }
    return category;
  }

  async createOrGetCategory(
    name: string,
    slug: string,
    parentId?: number,
    credentials?: WooCommerceCredentials,
  ): Promise<any> {
    try {
      if (!credentials) {
        throw new Error('Credenciales de WooCommerce no proporcionadas');
      }

      this.validateCredentials(credentials);
      const client = this.getWooCommerceClient(credentials);

      // Primero intentar obtener la categoría existente
      const existingCategories = await client.get('products/categories', {
        params: { slug },
      });

      if (existingCategories.data.length > 0) {
        return existingCategories.data[0];
      }

      // Si no existe, crear nueva categoría
      const categoryData = {
        name,
        slug,
        parent: parentId || 0,
      };

      const response = await client.post('products/categories', categoryData);
      return response.data;
    } catch (error) {
      throw new ProductError(
        `Error al crear/obtener categoría: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async retrieveProduct(
    productId: number,
    credentials: WooCommerceCredentials,
  ): Promise<WCProductDTO> {
    return await this.wcProductAdapter.retrieveProduct(productId, credentials);
  }

  async getProductBySku(
    sku: string,
    credentials: WooCommerceCredentials,
  ): Promise<WCProductDTO | null> {
    try {
      this.validateCredentials(credentials);
      const products = await this.wcProductAdapter.getProducts(credentials);
      return products.find((product) => product.sku === sku) || null;
    } catch (error) {
      throw new ProductError(
        `Error al obtener producto por SKU: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async getProductsBySkus(
    skus: string[],
    credentials: WooCommerceCredentials,
  ): Promise<WCProductDTO[]> {
    try {
      this.validateCredentials(credentials);
      const client = this.getWooCommerceClient(credentials);

      const response = await client.get('products', {
        params: {
          sku: skus.join(','),
        },
      });

      return response.data;
    } catch (error) {
      throw new ProductError(
        `Error al obtener productos por SKU: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}
