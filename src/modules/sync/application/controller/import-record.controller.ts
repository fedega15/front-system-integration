import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { ImportRecordDto } from '../dto/import-record.dto';
import { ImportRecordService } from '../service/import-history.service';

@Controller('import-records')
@UseGuards(JwtAuthGuard)
export class ImportRecordController {
  private readonly logger = new Logger(ImportRecordController.name);

  constructor(private readonly importRecordService: ImportRecordService) {}

  @Get()
  async getImportRecords(@Request() req: any): Promise<ImportRecordDto[]> {
    // TODO: ARMAR DTO Y SACAR ANY DE REQUEST
    try {
      this.logger.debug(
        'Import Record Controller - Request user:',
        JSON.stringify(req.user, null, 2),
      );

      const userId = req.user?.userId;
      const companyId = req.user?.Orgnum || req.user?.orgnum;

      if (!userId) {
        this.logger.error(
          'Import Record Controller - No user ID found in request',
        );
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      if (!companyId) {
        this.logger.error(
          'Import Record Controller - No company ID found in request',
        );
        throw new HttpException(
          'Company ID not found',
          HttpStatus.UNAUTHORIZED,
        );
      }

      this.logger.debug('Import Record Controller - Using values:', {
        userId,
        companyId,
      });

      return await this.importRecordService.getImportRecords(userId, companyId);
    } catch (error) {
      this.logger.error('Error getting import records:', error);
      throw error;
    }
  }

  @Get(':id')
  async getImportRecordById(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ImportRecordDto> {
    try {
      const record = await this.importRecordService.getImportRecordById(id);

      // Try both cases for Orgnum
      const companyId = req.user?.Orgnum || req.user?.orgnum;

      if (!companyId) {
        this.logger.error(
          'Import Record Controller - No company ID found in request',
        );
        throw new HttpException(
          'Company ID not found',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (record.companyId !== companyId) {
        this.logger.error(
          'Import Record Controller - Unauthorized access attempt:',
          {
            recordCompanyId: record.companyId,
            userCompanyId: companyId,
          },
        );
        throw new HttpException(
          'Unauthorized access to import record',
          HttpStatus.FORBIDDEN,
        );
      }

      return record;
    } catch (error) {
      this.logger.error('Error getting import record by id:', error);
      throw error;
    }
  }
}
