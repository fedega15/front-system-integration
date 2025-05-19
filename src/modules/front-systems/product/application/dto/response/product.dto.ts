import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO para stockQty
export class StockQtyDto {
  @IsInt()
  stockId: number;

  @IsInt()
  qty: number;
}

export class IdentifierDto {
  @IsString()
  id: string;

  @IsString()
  type: string;
}

export class ProductSizeDto {
  @IsString()
  identity: string;

  @IsString()
  @IsOptional()
  gtin?: string;

  @IsString()
  label: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockQtyDto)
  stockQty: StockQtyDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IdentifierDto)
  identifiers: IdentifierDto[] = [];
}

export class FSProductResponseDto {
  @IsInt()
  productid: number;

  @IsString()
  name: string;

  @IsString()
  number: string;

  @IsString()
  @IsOptional()
  variant?: string;

  @IsString()
  groupName: string;

  @IsString()
  @IsOptional()
  subgroupName?: string;

  @IsString()
  color: string;

  @IsString()
  season: string;

  @IsString()
  brand: string;

  @IsString()
  gender: string;

  @IsBoolean()
  isDiscontinued: boolean;

  @IsString()
  @IsOptional()
  tags?: string;

  @IsNumber()
  price: number;

  @IsString()
  upt: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  internalDescription?: string;

  @IsBoolean()
  isStockProduct: boolean;

  @IsString()
  pictureRef: string;

  @IsBoolean()
  isWebAvailable: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSizeDto)
  productSizes: ProductSizeDto[];

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsInt()
  cost: number;
}
export class ProductArrayDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FSProductResponseDto)
  products: FSProductResponseDto[];
}

export class FSCreateProductResponseDTO {
  @IsInt()
  productid: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsString()
  @IsOptional()
  variant?: string;

  @IsString()
  groupName: string;

  @IsString()
  @IsOptional()
  subgroupName?: string;

  @IsString()
  color: string;

  @IsString()
  season: string;

  @IsString()
  brand: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsBoolean()
  @IsOptional()
  isDiscontinued?: boolean;

  @IsString()
  @IsOptional()
  tags?: string;

  @IsNumber()
  price: number;

  @IsString()
  ins: string;

  @IsString()
  upt: string;

  @IsString()
  @IsOptional()
  description?: string;
}
