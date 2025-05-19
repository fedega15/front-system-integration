import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ImportService } from './import.service';
import { ProductFormatDefaults } from '../constants/product-format.defaults';
import { ImportException } from '../exception/import.exception';
import { User } from '../interface/user.interface';

@Injectable()
export class ScheduledSyncService {
  private readonly logger = new Logger(ScheduledSyncService.name);

  constructor(private readonly importService: ImportService) {}

  // @Cron(CronExpression.EVERY_HOUR)
  async syncProducts(user: User): Promise<void> {
    try {
      this.logger.log('Iniciando sincronización programada de productos');

      if (!user) {
        this.logger.error('El objeto user es undefined');
        throw new Error('El objeto user es undefined');
      }

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
