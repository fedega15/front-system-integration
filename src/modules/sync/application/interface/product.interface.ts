import { WCProductDTO } from '@/modules/woocommerce/product/application/dto';

export interface ProductSize {
  identity: string;
  gtin: string;
  label: string;
  stockQty: StockQuantity[];
  identifiers: any[];
}

export interface StockQuantity {
  qty: number;
  [key: string]: any;
}

export interface ProductAttribute {
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface ProductMetaData {
  key: string;
  value: string;
}

export interface ProductTag {
  name: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  [key: string]: any;
}

export interface ProductImportResult {
  imported: WCProductDTO[];
  skipped: {
    id: string;
    name: string;
    reason: string;
  }[];
  duplicated: {
    id: string;
    name: string;
  }[];
} 