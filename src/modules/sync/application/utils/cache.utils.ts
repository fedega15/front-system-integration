import { ProductCategory } from '../interface/product.interface';

export class CacheUtils {
  private static categoryCache: Map<string, ProductCategory> = new Map();
  private static attributeCache: Map<string, any> = new Map();

  static getCategory(slug: string, parentId?: number): ProductCategory | undefined {
    const cacheKey = `${slug}-${parentId || ''}`;
    return this.categoryCache.get(cacheKey);
  }

  static setCategory(slug: string, parentId: number | undefined, category: ProductCategory): void {
    const cacheKey = `${slug}-${parentId || ''}`;
    this.categoryCache.set(cacheKey, category);
  }

  static getAttribute(slug: string): any | undefined {
    return this.attributeCache.get(slug);
  }

  static setAttribute(slug: string, attribute: any): void {
    this.attributeCache.set(slug, attribute);
  }

  static clearCache(): void {
    this.categoryCache.clear();
    this.attributeCache.clear();
  }
} 