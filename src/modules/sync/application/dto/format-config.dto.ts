export interface ProductFormatConfig {
  nameFormat: string;
  descriptionFormat: string;
  variantOptions: {
    option1: 'size' | 'color' | 'group' | 'none';
    option2: 'size' | 'color' | 'group' | 'none';
    option3: 'size' | 'color' | 'group' | 'none';
  };
  filters?: {
    excludeSizesWithoutGTIN?: boolean;
    excludeSizesNotInStock?: boolean;
  };
  tags: {
    color?: boolean;
    season?: boolean;
    vendor?: boolean;
    productId?: boolean;
    productNumber?: boolean;
    productVariant?: boolean;
    group?: boolean;
    subgroup?: boolean;
  };
  genderTags: {
    man?: boolean;
    woman?: boolean;
    unisex?: boolean;
    child?: boolean;
    boy?: boolean;
    girl?: boolean;
    infant?: boolean;
  };
} 