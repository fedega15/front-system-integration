import { IStockQty } from '@/modules/webhook/application/interface/stock.interface';
import { Logger } from '@nestjs/common';

const logger = new Logger('extractGtinAndStock');

export function extractGtinAndStock(
  product: any,
  targetSku?: string,
  targetSize?: string,
): {
  gtin: string;
  stockQty: IStockQty[];
  stocksIds: number[];
  identity: number;
} | null {
  logger.debug(
    `Processing product ${product.id} with targetSize: ${targetSize}`,
    {
      hasMetaData: !!product.meta_data,
      metaDataLength: product.meta_data?.length,
    },
  );

  if (!product.meta_data) {
    logger.warn(`Product ${product.id} has no meta_data`);
    return null;
  }

  // Buscar en meta_data por talla
  if (targetSize) {
    logger.debug(`Searching for size ${targetSize} in meta_data`);

    for (const meta of product.meta_data) {
      try {
        const value = JSON.parse(meta.value);
        logger.debug(`Checking meta_data entry:`, {
          key: meta.key,
          parsedValue: value,
          hasLabel: !!value.label,
          label: value.label,
        });

        // Comparar ignorando mayúsculas/minúsculas y espacios
        const normalizedSize = targetSize.toLowerCase().trim();
        const normalizedLabel = (value.label || '').toLowerCase().trim();

        if (normalizedLabel === normalizedSize) {
          logger.debug(`Found matching size ${targetSize}`, value);
          return {
            identity: parseInt(value.identity),
            gtin: value.gtin || '',
            stockQty: value.stockQty.map((stock: any) => ({
              stockId: stock.stockId,
              qty: stock.qty,
            })),
            stocksIds: value.stockQty.map((stock: any) => stock.stockId),
          };
        }
      } catch (error) {
        logger.error(
          `Error parsing meta_data for product ${product.id}:`,
          error,
        );
      }
    }

    logger.warn(
      `No matching size found for product ${product.id} with size ${targetSize}. Available sizes:`,
      product.meta_data
        .map((meta) => {
          try {
            const value = JSON.parse(meta.value);
            return value.label;
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean),
    );
  }

  // Si no se encontró por talla, buscar el primer meta_data válido
  logger.debug(`Falling back to first valid meta_data entry`);
  for (const meta of product.meta_data) {
    try {
      const value = JSON.parse(meta.value);
      if (value.stockQty && value.identity) {
        logger.debug(`Found valid stock data`, value);
        return {
          identity: parseInt(value.identity),
          gtin: value.gtin || '',
          stockQty: value.stockQty.map((stock: any) => ({
            stockId: stock.stockId,
            qty: stock.qty,
          })),
          stocksIds: value.stockQty.map((stock: any) => stock.stockId),
        };
      }
    } catch (error) {
      logger.error(`Error parsing meta_data for product ${product.id}:`, error);
    }
  }

  logger.warn(`No valid stock data found for product ${product.id}`);
  return null;
}
