import { Injectable, Logger } from '@nestjs/common';
import { ImportRecordRepository } from '../../infrastructure/persistence/import-record.repository';
import { ImportRecordDto, ImportStatus } from '../dto/import-record.dto';
import { WCProductDTO } from '@/modules/woocommerce/product/application/dto';

@Injectable()
export class ImportRecordService {
  private readonly logger = new Logger(ImportRecordService.name);

  constructor(
    private readonly importRecordRepository: ImportRecordRepository,
  ) {}

  async getImportRecords(userId: string, companyId: string): Promise<ImportRecordDto[]> {
    try {
      const records = await this.importRecordRepository.findByUserIdAndCompanyId(userId, companyId);
      return records.map(record => this.mapToDto(record));
    } catch (error) {
      this.logger.error('Error getting import records:', error);
      throw error;
    }
  }

  async getImportRecordById(id: string): Promise<ImportRecordDto> {
    try {
      const record = await this.importRecordRepository.findById(id);
      if (!record) {
        throw new Error(`Import record with id ${id} not found`);
      }
      return this.mapToDto(record);
    } catch (error) {
      this.logger.error(`Error getting import record by id ${id}:`, error);
      throw error;
    }
  }

  private mapToDto(record: any): ImportRecordDto {
    return {
      userId: record.userId,
      companyId: record.companyId,
      totalProducts: record.totalProducts,
      importedProducts: record.importedProducts,
      skippedProducts: record.skippedProducts,
      duplicatedProducts: record.duplicatedProducts,
      skippedDetails: record.skippedDetails,
      duplicatedDetails: record.duplicatedDetails,
      importedDetails: record.importedDetails,
      startTime: record.startTime,
      endTime: record.endTime,
      status: record.status as ImportStatus,
      error: record.error
    };
  }

  async createImportRecord(
    userId: string,
    companyId: string,
    totalProducts: number,
    importedProducts: WCProductDTO[],
    skippedProducts: { id: string, name: string, reason: string }[],
    duplicatedProducts: { id: string, name: string }[],
    startTime: Date
  ): Promise<void> {
    if (importedProducts.length > 0) {
      const endTime = new Date();
      const status = skippedProducts.length === totalProducts ? 'error' :
                    skippedProducts.length > 0 ? 'partial' : 'success';

      try {
        const record = await this.importRecordRepository.create({
          userId,
          companyId,
          totalProducts,
          importedProducts: importedProducts.length,
          skippedProducts: skippedProducts.length,
          duplicatedProducts: duplicatedProducts.length,
          skippedDetails: skippedProducts,
          duplicatedDetails: duplicatedProducts,
          importedDetails: importedProducts.map(p => ({ id: p.sku, name: p.name })),
          startTime,
          endTime,
          status
        });

        this.logger.debug('Import record created successfully:', record);
      } catch (error) {
        this.logger.error('Error creating import record:', error);
        throw error;
      }
    }
  }
} 