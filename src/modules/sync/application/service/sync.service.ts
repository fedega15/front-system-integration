import { FSProductService } from '@/modules/front-systems/product/application/service/product.service';
import { WCProductService } from '@/modules/woocommerce/product/application/service/product.service';
import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import { ProductFormatConfig } from '../dto/format-config.dto';
import { User } from '../interface/user.interface';
import { ImportResultDto } from '../dto/import-result.dto';
import { ImportService } from './import.service';
import { ImportException } from '../exception/import.exception';
import { ProductFormatDefaults, SystemPaths } from '../config';
import { validateAndGetWooCommerceCredentials } from '../utils/woocommerce-credentials.utils';
import { ProductService } from './product.service';
import { ImportRecordService } from './import-history.service';

@Injectable()
export class SyncTasks {
  private readonly logger = new Logger(SyncTasks.name);

  constructor(
    private readonly frontSystemsService: FSProductService,
    @Inject(forwardRef(() => WCProductService))
    private readonly wcProductService: WCProductService,
    @Inject(forwardRef(() => ImportService))
    private readonly importService: ImportService,
    private readonly productService: ProductService,
    private readonly importRecordService: ImportRecordService,
  ) {
    if (!fs.existsSync(SystemPaths.TEMP_DIR)) {
      fs.mkdirSync(SystemPaths.TEMP_DIR, { recursive: true });
    }
  }

  async importProducts(
    formatConfig: ProductFormatConfig,
    userId: string,
    user: User,
  ): Promise<ImportResultDto> {
    const startTime = new Date();
    try {
      this.logger.log(`User ID: ${userId}`);

      if (!user || !user.Orgnum) {
        throw new Error('Invalid user object: missing Orgnum');
      }

      const wooCommerceCredentials = validateAndGetWooCommerceCredentials(user);
      const frontProducts = await this.productService.getAllProducts(user);
      const { existingSkus, duplicatedProducts } =
        await this.productService.checkDuplicates(
          frontProducts,
          wooCommerceCredentials,
        );
      const { importedProducts, skippedProducts } =
        await this.productService.processProducts(
          frontProducts,
          existingSkus,
          formatConfig,
          wooCommerceCredentials,
          userId,
          user.Orgnum,
        );
      await this.importRecordService.createImportRecord(
        userId,
        user.Orgnum,
        frontProducts.length,
        importedProducts,
        skippedProducts,
        duplicatedProducts,
        startTime,
      );

      return {
        imported: importedProducts,
        skipped: skippedProducts,
        duplicated: duplicatedProducts,
      };
    } catch (error) {
      this.logger.error('Error in importProducts:', error);
      throw error;
    }
  }

  // @Cron(CronExpression.EVERY_HOUR)
  async syncProducts(user: User): Promise<void> {
    try {
      this.logger.log('Iniciando sincronización programada de productos');

      await this.importService.importProducts(
        ProductFormatDefaults.DEFAULT_FORMAT_CONFIG,
        user.userId,
        user,
      );

      this.logger.log('Sincronización programada completada con éxito');
    } catch (error) {
      this.logger.error('Error en sincronización programada:', error);
      if (error instanceof ImportException) {
        throw error;
      }
      throw new ImportException(
        'Error en sincronización programada: ' +
          (error instanceof Error ? error.message : error),
      );
    }
  }
}
