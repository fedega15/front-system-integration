import { WooCommerceCredentials } from '@/modules/woocommerce/product/application/dto/woocommerce-credentials.dto';
import { WCProductDTO } from '@/modules/woocommerce/product/application/dto';
import { IImage } from '@/modules/woocommerce/product/application/interface/product.interface';

export interface ProductMapperDependencies {
  getOrCreateCategory: (
    name: string,
    slug: string,
    parentId?: number,
    credentials?: WooCommerceCredentials
  ) => Promise<any>;
  
  getOrCreateAttribute: (
    attributeData: any,
    credentials?: WooCommerceCredentials
  ) => Promise<any>;
  
  processImages: (images: string[]) => Promise<IImage[]>;
  
  createProductVariation: (
    productId: number,
    variation: any,
    credentials: WooCommerceCredentials
  ) => Promise<any>;
  
  createProduct: (
    product: WCProductDTO,
    credentials: WooCommerceCredentials
  ) => Promise<WCProductDTO>;
} 