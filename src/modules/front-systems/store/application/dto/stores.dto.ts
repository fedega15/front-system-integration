import {
  IsNumber,
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  IsPhoneNumber,
} from 'class-validator';

export class FSStoreDto {
  @IsNumber()
  StoreId: number;

  @IsOptional()
  @IsString()
  StoreNo?: string | null;

  @IsString()
  LegalName: string;

  @IsString()
  Orgnum: string;

  @IsString()
  StoreName: string;

  @IsString()
  @IsOptional()
  Address?: string;

  @IsString()
  @IsOptional()
  PostalCode?: string;

  @IsString()
  @IsOptional()
  City?: string;

  @IsString()
  @IsOptional()
  Country?: string;

  @IsString()
  @IsOptional()
  CountryCode?: string;

  @IsEmail()
  @IsOptional()
  Email?: string;

  @IsOptional()
  @IsUrl()
  Web?: string | null;

  @IsPhoneNumber('NO')
  @IsOptional()
  Phone?: string;

  @IsNumber()
  StockId: number;

  @IsOptional()
  @IsString()
  ExternalStockId?: string | null;

  @IsString()
  Currency: string;

  @IsString()
  TimeZone: string;

  @IsString()
  TimeZoneInfo: string;

  @IsString()
  @IsOptional()
  RetailPricelistID?: string;

  @IsString()
  @IsOptional()
  PricelistID?: string;
}
