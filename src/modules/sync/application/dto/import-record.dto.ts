import { IsString, IsNumber, IsDate, IsArray, IsEnum } from 'class-validator';

export enum ImportStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  PARTIAL = 'partial'
}

export class ImportRecordDetailDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  reason?: string;
}

export class ImportRecordDto {
  @IsString()
  userId: string;

  @IsString()
  companyId: string;

  @IsNumber()
  totalProducts: number;

  @IsNumber()
  importedProducts: number;

  @IsNumber()
  skippedProducts: number;

  @IsNumber()
  duplicatedProducts: number;

  @IsArray()
  skippedDetails: ImportRecordDetailDto[];

  @IsArray()
  duplicatedDetails: ImportRecordDetailDto[];

  @IsArray()
  importedDetails: ImportRecordDetailDto[];

  @IsDate()
  startTime: Date;

  @IsDate()
  endTime: Date;

  @IsEnum(ImportStatus)
  status: ImportStatus;

  @IsString()
  error?: string;
} 