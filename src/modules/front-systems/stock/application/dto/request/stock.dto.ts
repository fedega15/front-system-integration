import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FSStockFilterRequestDto {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  productIds?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  identities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gtiNs?: string[];

  @IsOptional()
  @IsBoolean()
  includeStockQuantity?: boolean;

  @IsOptional()
  @IsBoolean()
  includeEmptyGTINs?: boolean;
}

export class StockreservationRequestoDTO {
  @IsNumber()
  stockId: number;

  @IsNumber()
  customerId: number;

  @IsNumber()
  saleId: number;

  @IsString()
  extId: string;

  @IsOptional()
  @IsString()
  comment: string;

  @IsNumber()
  reservationLengthInHours: number;
}
export class StockReservationItemDto {
  @IsOptional()
  @IsNumber()
  qty?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  gtin?: string;

  @IsOptional()
  @IsString()
  identity?: string;

  @IsOptional()
  @IsString()
  externalSKU?: string;
}
export class StockReservationRequestDto {
  @IsOptional()
  @IsNumber()
  stockId?: number;

  @IsOptional()
  @IsNumber()
  customerId?: number;

  @IsOptional()
  @IsNumber()
  saleId?: number;

  @IsOptional()
  @IsString()
  extId?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsNumber()
  reservationLengthInHours?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockReservationItemDto)
  items?: StockReservationItemDto[];
}

export class StockLevelDto {
  @IsString()
  id: string; // GTIN o ExternalSKU

  @IsNumber()
  stockId: number;

  @IsNumber()
  quantity: number;
}
