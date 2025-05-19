import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
  IsBoolean,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  IAttribute,
  ICategory,
  IImage,
} from '../../../interface/product.interface';

// Interfaces
class ProductCategoryImageDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsUrl()
  src?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  alt?: string;
}

class VariationDownloadDto {
  @IsString()
  id: string; // ID del archivo

  @IsString()
  name: string; // Nombre del archivo

  @IsString()
  file: string; // URL del archivo
}

class VariationDimensionsDto {
  @IsOptional()
  @IsString()
  length?: string; // Longitud de la variación

  @IsOptional()
  @IsString()
  width?: string; // Ancho de la variación

  @IsOptional()
  @IsString()
  height?: string; // Altura de la variación
}

class VariationImageDto {
  @IsOptional()
  @IsNumber()
  id?: number; // ID de la imagen

  @IsOptional()
  @IsString()
  src?: string; // URL de la imagen

  @IsOptional()
  @IsString()
  name?: string; // Nombre de la imagen

  @IsOptional()
  @IsString()
  alt?: string; // Texto alternativo de la imagen
}
class VariationAttributeDto {
  @IsOptional() // Marcar como opcional
  @IsNumber()
  id?: number; // ID del atributo (opcional)

  @IsString()
  name: string; // Nombre del atributo

  @IsString()
  option: string; // Término seleccionado del atributo
}
  
class VariationMetaDataDto {
  @IsString()
  key: string; // Clave del metadato

  @IsString()
  value: string; // Valor del metadato
}

// Add this class for meta data
class MetaDataDto {
    @IsString()
    key: string;

    @IsString()
    value: string;
}

export class TagDto {
    @IsOptional()
    @IsNumber()
    id?: number;

    @IsString()
    name: string;
}

//PRODUCT
export class WCCreateProductRequestDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  regular_price: string;

  @IsString()
  short_description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ICategory)
  categories: ICategory[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  images: IImage[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IAttribute)
  attributes: IAttribute[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagDto)
  tags?: TagDto[];  

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaDataDto)
  meta_data?: MetaDataDto[];

  @IsString()
  slug: string;
}
//CATEGORY
export class WCProductCategoryRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsNumber()
  parent?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  display?: string;

  @IsOptional()
  image?: ProductCategoryImageDto;

  @IsOptional()
  @IsNumber()
  menu_order?: number;
}

// ATTRIBUTE
export class WCProductAttributeRequestDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  order_by?: string;

  @IsOptional()
  @IsBoolean()
  has_archives?: boolean;
}

export class WCProductVariationRequestDto {
  @IsOptional()
  @IsString()
  description?: string; // Descripción de la variación

  @IsOptional()
  @IsString()
  sku?: string; // SKU único de la variación

  @IsOptional()
  @IsString()
  regular_price?: string; // Precio regular de la variación

  @IsOptional()
  @IsString()
  sale_price?: string; // Precio de oferta de la variación

  @IsOptional()
  @IsString()
  date_on_sale_from?: string; // Fecha de inicio de la oferta (en la zona horaria del sitio)

  @IsOptional()
  @IsString()
  date_on_sale_from_gmt?: string; // Fecha de inicio de la oferta (en GMT)

  @IsOptional()
  @IsString()
  date_on_sale_to?: string; // Fecha de fin de la oferta (en la zona horaria del sitio)

  @IsOptional()
  @IsString()
  date_on_sale_to_gmt?: string; // Fecha de fin de la oferta (en GMT)

  @IsOptional()
  @IsString()
  status?: string; // Estado de la variación (por defecto "publish")

  @IsOptional()
  @IsBoolean()
  virtual?: boolean; // Si la variación es virtual (por defecto false)

  @IsOptional()
  @IsBoolean()
  downloadable?: boolean; // Si la variación es descargable (por defecto false)

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariationDownloadDto)
  downloads?: VariationDownloadDto[]; // Archivos descargables

  @IsOptional()
  @IsNumber()
  download_limit?: number; // Límite de descargas (por defecto -1)

  @IsOptional()
  @IsNumber()
  download_expiry?: number; // Días hasta que expira el acceso a las descargas (por defecto -1)

  @IsOptional()
  @IsString()
  tax_status?: string; // Estado fiscal (por defecto "taxable")

  @IsOptional()
  @IsString()
  tax_class?: string; // Clase fiscal

  @IsOptional()
  @IsBoolean()
  manage_stock?: boolean; // Gestión de stock a nivel de variación (por defecto false)

  @IsOptional()
  @IsNumber()
  stock_quantity?: number; // Cantidad de stock

  @IsOptional()
  @IsString()
  stock_status?: string; // Estado del stock (por defecto "instock")

  @IsOptional()
  @IsString()
  backorders?: string; // Backorders permitidos (por defecto "no")

  @IsOptional()
  @IsString()
  weight?: string; // Peso de la variación

  @IsOptional()
  @ValidateNested()
  @Type(() => VariationDimensionsDto)
  dimensions?: VariationDimensionsDto; // Dimensiones de la variación

  @IsOptional()
  @IsString()
  shipping_class?: string; // Clase de envío

  @IsOptional()
  @ValidateNested()
  @Type(() => VariationImageDto)
  image?: VariationImageDto; // Imagen de la variación

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariationAttributeDto)
  attributes?: VariationAttributeDto[]; // Atributos de la variación

  @IsOptional()
  @IsNumber()
  menu_order?: number; // Orden en el menú

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariationMetaDataDto)
  meta_data?: VariationMetaDataDto[]; // Metadatos de la variación
}
export class FrontSystemProduct {
  productid: number;
  name: string;
  groupName: string;
  price: number;
  description: string;
  images: string[];
  productSizes: {
    label: string;
    stockQty: { qty: number }[];
  }[];
}