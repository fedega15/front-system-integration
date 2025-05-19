import {
  IsArray,
  IsNumber,
  IsString,
  ValidateNested,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsObject,
  IsRFC3339,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  IAttribute,
  ICategory,
  IDefaultAttribute,
  IDimension,
  IImage,
  ILinks,
} from '../../../interface/product.interface';

class ProductImageDto {
  @IsNumber()
  id: number;

  @IsString()
  date_created: string;

  @IsString()
  date_created_gmt: string;

  @IsString()
  date_modified: string;

  @IsString()
  date_modified_gmt: string;

  @IsString()
  src: string;

  @IsString()
  name: string;

  @IsString()
  alt: string;
}

class ProductLinksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  self: LinkDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  collection: LinkDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  up: LinkDto[];
}

class LinkDto {
  @IsString()
  href: string;
}

class DownloadDto {
  @IsString()
  id: string; // ID del archivo

  @IsString()
  name: string; // Nombre del archivo

  @IsString()
  file: string; // URL del archivo
}

class DimensionsDto {
  @IsString()
  length: string; // Longitud de la variación

  @IsString()
  width: string; // Ancho de la variación

  @IsString()
  height: string; // Altura de la variación
}

class ImageDto {
  @IsNumber()
  id: number; // ID de la imagen

  @IsString()
  date_created: string; // Fecha de creación de la imagen (en la zona horaria del sitio)

  @IsString()
  date_created_gmt: string; // Fecha de creación de la imagen (en GMT)

  @IsString()
  date_modified: string; // Fecha de la última modificación de la imagen (en la zona horaria del sitio)

  @IsString()
  date_modified_gmt: string; // Fecha de la última modificación de la imagen (en GMT)

  @IsString()
  src: string; // URL de la imagen

  @IsString()
  name: string; // Nombre de la imagen

  @IsString()
  alt: string; // Texto alternativo de la imagen
}

class AttributeDto {
  @IsNumber()
  id: number; // ID del atributo

  @IsString()
  name: string; // Nombre del atributo

  @IsString()
  option: string; // Término seleccionado del atributo
}

class MetaDataDto {
  @IsNumber()
  id: number; // ID del metadato (solo lectura)

  @IsString()
  key: string; // Clave del metadato

  @IsString()
  value: string; // Valor del metadato
}

// PRODUCT
export class WCProductDTO {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  permalink: string;

  @IsOptional()
  @IsDateString()
  date_created: string;

  @IsOptional()
  @IsDateString()
  date_created_gmt: string;

  @IsOptional()
  @IsDateString()
  date_modified: string;

  @IsOptional()
  @IsDateString()
  date_modified_gmt: string;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsBoolean()
  featured: boolean;

  @IsOptional()
  @IsString()
  catalog_visibility: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  short_description: string;

  @IsString()
  sku: string;

  @IsString()
  price: string;

  @IsOptional()
  @IsString()
  regular_price: string;

  @IsOptional()
  @IsString()
  sale_price: string;

  @IsOptional()
  @IsDateString()
  date_on_sale_from: string | null;

  @IsOptional()
  @IsDateString()
  date_on_sale_from_gmt: string | null;

  @IsOptional()
  @IsDateString()
  date_on_sale_to: string | null;

  @IsOptional()
  @IsDateString()
  date_on_sale_to_gmt: string | null;

  @IsOptional()
  @IsString()
  price_html: string;

  @IsOptional()
  @IsBoolean()
  on_sale: boolean;

  @IsOptional()
  @IsBoolean()
  purchasable: boolean;

  @IsOptional()
  @IsNumber()
  total_sales: number;

  @IsOptional()
  @IsBoolean()
  virtual: boolean;

  @IsOptional()
  @IsBoolean()
  downloadable: boolean;

  @IsOptional()
  @IsArray()
  downloads: any[];

  @IsOptional()
  @IsNumber()
  download_limit: number;

  @IsOptional()
  @IsNumber()
  download_expiry: number;

  @IsString()
  external_url: string;

  @IsString()
  @IsOptional()
  button_text: string;

  @IsString()
  tax_status: string;

  @IsString()
  @IsOptional()
  tax_class: string;

  @IsBoolean()
  manage_stock: boolean;

  @IsNumber()
  stock_quantity: number | null;

  @IsString()
  stock_status: string;

  @IsString()
  backorders: string;

  @IsBoolean()
  backorders_allowed: boolean;

  @IsBoolean()
  backordered: boolean;

  @IsString()
  low_stock_amount: string | null;

  @IsBoolean()
  sold_individually: boolean;

  @IsString()
  @IsOptional()
  weight: string;

  @ValidateNested()
  @Type(() => IDimension)
  dimensions: IDimension;

  @IsBoolean()
  shipping_required: boolean;

  @IsBoolean()
  shipping_taxable: boolean;

  @IsString()
  @IsOptional()
  shipping_class: string;

  @IsOptional()
  @IsNumber()
  shipping_class_id: number;

  @IsOptional()
  @IsBoolean()
  reviews_allowed: boolean;

  @IsOptional()
  @IsString()
  average_rating: string;

  @IsOptional()
  @IsNumber()
  rating_count: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  related_ids: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  upsell_ids: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  cross_sell_ids: number[];

  @IsOptional()
  @IsNumber()
  parent_id: number;

  @IsOptional()
  @IsString()
  purchase_note: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ICategory)
  categories: ICategory[];

  @IsOptional()
  @IsArray()
  tags: any[]; // Puedes definir un DTO específico si es necesario

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  images: IImage[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IAttribute)
  attributes: IAttribute[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IDefaultAttribute)
  default_attributes: IDefaultAttribute[];

  @IsOptional()
  @IsArray()
  variations: number[]; // Puedes definir un DTO específico si es necesario

  @IsOptional()
  @IsArray()
  grouped_products: any[]; // Puedes definir un DTO específico si es necesario

  @IsOptional()
  @IsNumber()
  menu_order: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaDataDto)
  meta_data: any[]; // Puedes definir un DTO específico si es necesario

  @IsOptional()
  @IsBoolean()
  has_options: boolean;

  @IsOptional()
  @IsString()
  post_password: string;

  @IsOptional()
  @IsString()
  global_unique_id: string;

  @IsOptional()
  @IsArray()
  brands: any[]; // Puedes definir un DTO específico si es necesario

  @IsOptional()
  @ValidateNested()
  @Type(() => ILinks)
  _links: ILinks;
}

// CATEGORY
export class WCProductCategoryResponseDto {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug: string;

  @IsOptional()
  @IsNumber()
  parent: number;

  @IsOptional()
  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @IsString()
  display: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductImageDto)
  image: ProductImageDto;

  @IsOptional()
  @IsNumber()
  menu_order: number;

  @IsOptional()
  @IsNumber()
  count: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductLinksDto)
  _links: ProductLinksDto;
}

// ATTRIBUTE
export class WCProductAttributeResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  type: string;

  @IsString()
  order_by: string;

  @IsBoolean()
  has_archives: boolean;

  @ValidateNested()
  @Type(() => ProductLinksDto)
  _links: ProductLinksDto;
}

export class WCProductVariationResponseDto {
  @IsOptional()
  @IsNumber()
  id: number; // Identificador único de la variación (solo lectura)

  @IsOptional()
  @IsString()
  date_created: string; // Fecha de creación de la variación (en la zona horaria del sitio)

  @IsOptional()
  @IsString()
  date_created_gmt: string; // Fecha de creación de la variación (en GMT)

  @IsOptional()
  @IsString()
  date_modified: string; // Fecha de la última modificación de la variación (en la zona horaria del sitio)

  @IsOptional()
  @IsString()
  date_modified_gmt: string; // Fecha de la última modificación de la variación (en GMT)

  @IsOptional()
  @IsString()
  description: string; // Descripción de la variación

  @IsOptional()
  @IsString()
  permalink: string; // URL de la variación (solo lectura)

  @IsOptional()
  @IsString()
  sku: string; // SKU único de la variación

  @IsOptional()
  @IsString()
  price: string; // Precio actual de la variación (solo lectura)

  @IsOptional()
  @IsString()
  regular_price: string; // Precio regular de la variación

  @IsOptional()
  @IsString()
  sale_price: string; // Precio de oferta de la variación

  @IsOptional()
  @IsString()
  date_on_sale_from: string | null; // Fecha de inicio de la oferta (en la zona horaria del sitio)

  @IsOptional()
  @IsString()
  date_on_sale_from_gmt: string | null; // Fecha de inicio de la oferta (en GMT)

  @IsOptional()
  @IsString()
  date_on_sale_to: string | null; // Fecha de fin de la oferta (en la zona horaria del sitio)

  @IsOptional()
  @IsString()
  date_on_sale_to_gmt: string | null; // Fecha de fin de la oferta (en GMT)

  @IsOptional()
  @IsBoolean()
  on_sale: boolean; // Indica si la variación está en oferta (solo lectura)

  @IsOptional()
  @IsBoolean()
  status: boolean; // Estado de la variación

  @IsOptional()
  @IsBoolean()
  purchasable: boolean; // Indica si la variación se puede comprar (solo lectura)

  @IsOptional()
  @IsBoolean()
  virtual: boolean; // Indica si la variación es virtual

  @IsOptional()
  @IsBoolean()
  downloadable: boolean; // Indica si la variación es descargable

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DownloadDto)
  downloads: DownloadDto[]; // Archivos descargables

  @IsOptional()
  @IsNumber()
  download_limit: number; // Límite de descargas

  @IsOptional()
  @IsNumber()
  download_expiry: number; // Días hasta que expira el acceso a las descargas

  @IsOptional()
  @IsString()
  tax_status: string; // Estado fiscal

  @IsOptional()
  @IsString()
  tax_class: string; // Clase fiscal

  @IsOptional()
  @IsBoolean()
  manage_stock: boolean; // Gestión de stock a nivel de variación

  @IsOptional()
  @IsNumber()
  stock_quantity: number | null; // Cantidad de stock

  @IsOptional()
  @IsString()
  stock_status: string; // Estado del stock

  @IsOptional()
  @IsString()
  backorders: string; // Backorders permitidos

  @IsOptional()
  @IsBoolean()
  backorders_allowed: boolean; // Indica si se permiten backorders (solo lectura)

  @IsOptional()
  @IsBoolean()
  backordered: boolean; // Indica si la variación está en backorder (solo lectura)

  @IsOptional()
  @IsString()
  weight: string; // Peso de la variación

  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions: DimensionsDto; // Dimensiones de la variación

  @IsOptional()
  @IsString()
  shipping_class: string; // Clase de envío

  @IsOptional()
  @IsNumber()
  shipping_class_id: number; // ID de la clase de envío (solo lectura)

  @IsOptional()
  @ValidateNested()
  @Type(() => ImageDto)
  image: ImageDto; // Imagen de la variación

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeDto)
  attributes: AttributeDto[]; // Atributos de la variación

  @IsOptional()
  @IsNumber()
  menu_order: number; // Orden en el menú

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaDataDto)
  meta_data: MetaDataDto[]; // Metadatos de la variación

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductLinksDto)
  _links: ProductLinksDto; // Enlaces a recursos relacionados (solo lectura)
}
