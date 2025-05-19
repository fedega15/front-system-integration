import { ProductFormatConfig } from '../dto/format-config.dto';

export class ProductFormatDefaults {
  static readonly DEFAULT_FORMAT_CONFIG: ProductFormatConfig = {
    nameFormat: '{name} {brand} {color}',
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
      unisex: true
    },
    variantOptions: {
      option1: 'size',
      option2: 'color',
      option3: 'none'
    },
    filters: {
      excludeSizesWithoutGTIN: true,
      excludeSizesNotInStock: true
    }
  };
} 