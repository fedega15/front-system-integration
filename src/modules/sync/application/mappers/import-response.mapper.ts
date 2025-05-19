import { ImportResponseDto } from '../dto/import-response.dto';
import { WCProductDTO } from '@/modules/woocommerce/product/application/dto';

interface ImportResult {
  imported: WCProductDTO[];
  skipped: { id: string; name: string; reason: string }[];
  duplicated: { id: string; name: string }[];
}

export const mapImportResponse = (result: ImportResult): ImportResponseDto => {
  return {
    message: `Importación de productos completada exitosamente. (${result.imported.length} importados, ${result.skipped.length} omitidos, ${result.duplicated?.length || 0} duplicados)`,
    summary: {
      totalImported: result.imported.length,
      totalSkipped: result.skipped.length,
      totalDuplicated: result.duplicated?.length || 0,
    },
    details: {
      imported: result.imported.map((product) => ({
        id: product.id.toString(),
        name: product.name,
        sku: product.sku,
      })),
      skipped: result.skipped.map((product) => ({
        id: product.id,
        name: product.name,
        reason: product.reason || 'Sin GTIN',
      })),
      duplicated:
        result.duplicated?.map((product) => ({
          id: product.id,
          name: product.name,
        })) || [],
    },
  };
}; 