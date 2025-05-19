import { WCProductDTO } from '@/modules/woocommerce/product/application/dto';

export interface ImportResultDto {
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