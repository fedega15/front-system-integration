import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsISO8601,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StockCountItem {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serials?: string[] | null;

  @IsInt()
  quantity: number;

  @IsOptional()
  @IsNumber()
  cost?: number | null;

  @IsOptional()
  @IsString()
  gtin?: string | null;

  @IsOptional()
  @IsString()
  identity?: string | null;

  @IsOptional()
  @IsString()
  externalSKU?: string | null;
}

export class StockCountDTO {
  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  stockId?: number | null;

  @IsOptional()
  @IsString()
  stockExtId?: string | null;

  @IsOptional()
  @IsString()
  stockCountTime?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockCountItem)
  items?: StockCountItem[] | null;

  @IsBoolean()
  isCompleteStockCount: boolean;

  @IsOptional()
  @IsBoolean()
  saveAsStockCount?: boolean | null;
}

export class StockQuantityDTO {
  @IsString()
  id: string;

  @IsInt()
  stockId: number;

  @IsNumber()
  quantity: number;
}

export class StockCountFilterDTO {
  @IsOptional()
  @IsInt()
  pageSize?: number;

  @IsOptional()
  @IsInt()
  pageSkip?: number;

  @IsOptional()
  @IsISO8601()
  ins?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  stockIds?: number[];

  @IsOptional()
  @IsBoolean()
  suppressZeroes?: boolean;

  @IsOptional()
  @IsBoolean()
  excludeStockReservations?: boolean;

  @IsOptional()
  @IsBoolean()
  useGTIN?: boolean;
}

export class StockCountResponseDTO {
  @IsInt()
  count: number;
}

export class FSStockResponseDto {
  @IsString()
  productId: string;

  @IsString()
  identity: string;

  @IsNumber()
  stockQty: number;

  @IsString()
  locationId: string;
}

export class FSStockLocationResponseDto {
  @IsString()
  locationId: string;

  @IsString()
  locationName: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;

  @IsBoolean()
  isActive: boolean;

  @IsNumber()
  capacity: number;

  @IsNumber()
  currentStock: number;
}

export class StockReservationResponseDto {
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
  @IsString()
  ins?: string;

  @IsOptional()
  @IsString()
  expirationDateTime?: string;

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
