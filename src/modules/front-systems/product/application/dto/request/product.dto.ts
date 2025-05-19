import { Type } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsString,
  IsDateString,
  IsNotEmpty,
  ValidateNested,
  IsUUID,
} from 'class-validator';

class CreateProductSizeDto {
  @IsString()
  @IsNotEmpty()
  gtin: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  externalSKU: string;

  @IsString()
  @IsNotEmpty()
  labelSortIndex: string;
}

export class FSProductFilterRequestDto {
  @IsOptional()
  @IsNumber()
  pageSize?: number;

  @IsOptional()
  @IsNumber()
  pageSkip?: number;

  @IsOptional()
  @IsDateString()
  upt?: string;

  @IsOptional()
  @IsBoolean()
  isWebAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  isDiscontinued?: boolean;

  @IsOptional()
  @IsBoolean()
  includePricelists?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seasons?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brands?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  includeEmptyGTINs?: boolean;

  @IsOptional()
  @IsBoolean()
  includeStockQuantity?: boolean;

  @IsOptional()
  @IsNumber()
  productId?: number;

  @IsOptional()
  @IsString()
  identity?: string;

  @IsOptional()
  @IsString()
  gtin?: string;

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
  includeAlternativeIdentifiers?: boolean;
}

export class FSCreateProductRequestDto {
  @IsBoolean()
  @IsOptional()
  createProductSpecificSize?: boolean;

  @IsUUID()
  @IsOptional()
  id?: boolean;

  @IsString()
  @IsNotEmpty()
  extId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsString()
  @IsOptional()
  variant?: string;

  @IsString()
  @IsNotEmpty()
  groupName: string;

  @IsString()
  @IsOptional()
  subgroupName?: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  season: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  tags?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isStockProduct?: boolean;

  @IsBoolean()
  @IsOptional()
  isWebAvailable?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSizeDto)
  @IsOptional()
  productSizes?: CreateProductSizeDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsBoolean()
  @IsOptional()
  isNoLabel?: boolean;
}
