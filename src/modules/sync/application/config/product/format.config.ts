import { ProductFormatConfig } from '../../dto/format-config.dto';

export const ProductFormatDefaults = {
  DEFAULT_FORMAT_CONFIG: {
    nameFormat: '{name}',
    descriptionFormat: '{description}',
    tags: {
      color: true,
      season: true,
      vendor: true,
      productId: true,
      productNumber: true,
      productVariant: true,
      group: true,
      subgroup: true
    },
    genderTags: {
      woman: true,
      man: true,
      unisex: true,
      child: false,
      boy: false,
      girl: false,
      infant: false
    },
    filters: {
      excludeSizesWithoutGTIN: true,
      excludeSizesNotInStock: false
    },
    variantOptions: {
      option1: 'size',
      option2: 'color',
      option3: 'none'
    }
  } as ProductFormatConfig,

  VARIANT_OPTIONS: {
    SIZE: 'size',
    COLOR: 'color',
    NONE: 'none'
  } as const,

  TAG_TYPES: {
    COLOR: 'color',
    SEASON: 'season',
    VENDOR: 'vendor',
    PRODUCT_ID: 'productId',
    PRODUCT_NUMBER: 'productNumber',
    PRODUCT_VARIANT: 'productVariant',
    GROUP: 'group',
    SUBGROUP: 'subgroup'
  } as const
} as const; 