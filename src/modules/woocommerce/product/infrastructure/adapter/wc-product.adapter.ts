import { Injectable } from '@nestjs/common';
import { WoocommerceHttpClientService } from '@/common/application/service/woocommerce-client.service';
import {
  WCCreateProductRequestDTO,
  WCProductDTO,
  WCUpdateProductRequestDTO,
  WCUpdateProductResponseDTO,
  WCProductCategoryRequestDto,
  WCProductCategoryResponseDto,
  WCProductAttributeRequestDto,
  WCProductAttributeResponseDto,
  WCProductVariationRequestDto,
  WCProductVariationResponseDto,
} from '../../application/dto';
import { WooCommerceCredentials } from '@/modules/woocommerce/application/service/woocommerce-base.service';

@Injectable()
export class WCProductAdapter {
  constructor(
    private readonly woocommerceClient: WoocommerceHttpClientService,
  ) {}

  async createProduct(
    productData: WCCreateProductRequestDTO,
    credentials: WooCommerceCredentials
  ): Promise<WCProductDTO> {
    return await this.woocommerceClient.post<WCProductDTO>(
      '/products',
      productData,
      credentials
    );
  }

  async updateProduct(
    productId: number,
    productData: WCUpdateProductRequestDTO,
    credentials: WooCommerceCredentials
  ): Promise<WCUpdateProductResponseDTO> {
    return await this.woocommerceClient.put<WCUpdateProductResponseDTO>(
      `/products/${productId}`,
      productData,
      credentials
    );
  }

  async createCategory(
    categoryData: WCProductCategoryRequestDto,
    credentials: WooCommerceCredentials
  ): Promise<WCProductCategoryResponseDto> {
    return await this.woocommerceClient.post<WCProductCategoryResponseDto>(
      '/products/categories',
      categoryData,
      credentials
    );
  }

  async createAttribute(
    attributeData: WCProductAttributeRequestDto,
    credentials: WooCommerceCredentials
  ): Promise<WCProductAttributeResponseDto | null> {
    return await this.woocommerceClient.post<WCProductAttributeResponseDto>(
      '/products/attributes',
      attributeData,
      credentials
    );
  }

  async createProductVariation(
    productId: number,
    variationData: WCProductVariationRequestDto,
    credentials: WooCommerceCredentials
  ): Promise<WCProductVariationResponseDto> {
    return await this.woocommerceClient.post<WCProductVariationResponseDto>(
      `/products/${productId}/variations`,
      variationData,
      credentials
    );
  }

  async getProducts(credentials: WooCommerceCredentials): Promise<WCProductDTO[]> {
    return await this.woocommerceClient.get<WCProductDTO[]>('/products', credentials);
  }

  async getAttributes(credentials: WooCommerceCredentials): Promise<WCProductAttributeResponseDto[]> {
    return await this.woocommerceClient.get<WCProductAttributeResponseDto[]>(
      '/products/attributes',
      credentials
    );
  }

  async getCategories(credentials: WooCommerceCredentials): Promise<WCProductCategoryResponseDto[]> {
    return await this.woocommerceClient.get<WCProductCategoryResponseDto[]>(
      '/products/categories',
      credentials
    );
  }

  async retrieveProduct(productId: number, credentials: WooCommerceCredentials): Promise<WCProductDTO> {
    return await this.woocommerceClient.get<WCProductDTO>(
      `/products/${productId}`,
      credentials
    );
  }

  async createOrGetCategory(
    name: string, 
    slug: string, 
    parentId?: number,
    credentials?: WooCommerceCredentials
  ): Promise<WCProductCategoryResponseDto> {
    try {
      if (!credentials) {
        throw new Error('Credenciales de WooCommerce no proporcionadas');
      }
      return await this.getCategoryBySlug(slug, credentials);
    } catch (error) {
      const categoryData: WCProductCategoryRequestDto = { name, slug, parent: parentId };
      return await this.createCategory(categoryData, credentials);
    }
  }

  async getCategoryBySlug(slug: string, credentials: WooCommerceCredentials): Promise<WCProductCategoryResponseDto> {
    const categories = await this.getCategories(credentials);
    const category = categories.find((cat) => cat.slug === slug);

    if (!category) {
      throw new Error(`Category with slug ${slug} not found`);
    }

    return category;
  }

  async createOrGetAttribute(
    attributeData: WCProductAttributeRequestDto,
    credentials: WooCommerceCredentials
  ): Promise<WCProductAttributeResponseDto> {
    try {
      const existingAttributes = await this.getAttributes(credentials);
      const existingAttribute = existingAttributes.find(attr => attr.slug === attributeData.slug);
      if (existingAttribute) {
        return existingAttribute;
      }
      return await this.createAttribute(attributeData, credentials);
    } catch (error) {
      throw new Error(`Failed to create or retrieve attribute: ${attributeData.name}`);
    }
  }
}
