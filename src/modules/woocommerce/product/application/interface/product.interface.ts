import {
  IsArray,
  IsNumber,
  IsString,
  ValidateNested,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ICategory {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug: string;
}

// Define the IImage interface for centralized type definitions
export interface IImage {
  src: string;
  alt: string;
  position?: number;
}

export class IDimension {
  @IsOptional()
  @IsString()
  length: string;

  @IsOptional()
  @IsString()
  width: string;

  @IsOptional()
  @IsString()
  height: string;
}

export class IAttribute {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  position: number;

  @IsOptional()
  @IsBoolean()
  visible: boolean;

  @IsOptional()
  @IsBoolean()
  variation: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options: string[];
}

export class IDefaultAttribute {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  option: string;
}

export class ILink {
  @IsOptional()
  @IsString()
  href: string;
}

export class ILinks {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ILink)
  self: ILink[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ILink)
  collection: ILink[];
}

// Create a class that implements the IImage interface
export class Image implements IImage {
  id: number;
  src: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  name: string;
  alt: string;
}
