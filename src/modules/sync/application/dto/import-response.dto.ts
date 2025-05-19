export class ImportedProductDto {
  id: string;
  name: string;
  sku: string;
}

export class SkippedProductDto {
  id: string;
  name: string;
  reason: string;
}

export class DuplicatedProductDto {
  id: string;
  name: string;
}

export class ImportSummaryDto {
  totalImported: number;
  totalSkipped: number;
  totalDuplicated: number;
}

export class ImportDetailsDto {
  imported: ImportedProductDto[];
  skipped: SkippedProductDto[];
  duplicated: DuplicatedProductDto[];
}

export class ImportResponseDto {
  message: string;
  summary: ImportSummaryDto;
  details: ImportDetailsDto;
} 