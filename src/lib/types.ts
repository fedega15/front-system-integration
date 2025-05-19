export interface ImportProductsResponse {
  message: string;
  summary: {
    totalImported: number;
    totalSkipped: number;
    totalDuplicated: number;
  };
  details: {
    imported: Array<{
      id: number;
      name: string;
      sku: string;
    }>;
    skipped: Array<{
      id: string;
      name: string;
      reason: string;
    }>;
    duplicated: Array<{
      id: string;
      name: string;
    }>;
  };
} 