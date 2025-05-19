export class ProductFilterDto {
  pageSize: number = 1000;
  pageSkip: number = 0;
  isWebAvailable: boolean = true;
  isDiscontinued: boolean = false;
  includeEmptyGTINs: boolean = true;
  includeStockQuantity: boolean = true;
  includePricelists: boolean = true;
  includeAlternativeIdentifiers: boolean = true;
} 