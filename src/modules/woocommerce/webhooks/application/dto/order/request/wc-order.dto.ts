import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class LinkDto {
  @IsString()
  href: string;
}

export class OrderLinksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  self: LinkDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  collection: LinkDto[];
}

// Order - Meta data properties
class MetaDataDto {
  @IsNumber()
  id: number;

  @IsString()
  key: string;

  @IsString()
  value: string;
}

// Order - Billing properties
class BillingDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  @IsOptional()
  company: string;

  @IsString()
  address_1: string;

  @IsString()
  @IsOptional()
  address_2: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postcode: string;

  @IsString()
  country: string;

  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  phone: string;
}

// Order - Shipping properties
class ShippingDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  @IsOptional()
  company: string;

  @IsString()
  address_1: string;

  @IsString()
  @IsOptional()
  address_2: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postcode: string;

  @IsString()
  country: string;

  @IsString()
  @IsOptional()
  phone: string;
}

// Order - Tax lines properties
class TaxLineDto {
  @IsNumber()
  id: number;

  @IsString()
  rate_code: string;

  @IsNumber()
  rate_id: number;

  @IsString()
  label: string;

  @IsBoolean()
  compound: boolean;

  @IsString()
  tax_total: string;

  @IsString()
  shipping_tax_total: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaDataDto)
  meta_data: MetaDataDto[];
}

// Order - Shipping lines properties
class ShippingLineDto {
  @IsNumber()
  id: number;

  @IsString()
  method_title: string;

  @IsString()
  method_id: string;

  @IsString()
  total: string;

  @IsString()
  total_tax: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxLineDto)
  taxes: TaxLineDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaDataDto)
  meta_data: MetaDataDto[];
}

// Order - Fee lines properties
class FeeLineDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  tax_class: string;

  @IsString()
  @IsOptional()
  tax_status: string;

  @IsString()
  total: string;

  @IsString()
  total_tax: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxLineDto)
  taxes: TaxLineDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaDataDto)
  meta_data: MetaDataDto[];
}

// Order - Coupon lines properties
class CouponLineDto {
  @IsNumber()
  id: number;

  @IsString()
  code: string;

  @IsString()
  discount: string;

  @IsString()
  discount_tax: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaDataDto)
  meta_data: MetaDataDto[];
}

// Order - Refunds properties
class RefundDto {
  @IsNumber()
  id: number;

  @IsString()
  reason: string;

  @IsString()
  total: string;
}

// Order - Line items properties
class LineItemDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsNumber()
  product_id: number;

  @IsNumber()
  @IsOptional()
  variation_id: number;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  tax_class: string;

  @IsString()
  subtotal: string;

  @IsString()
  subtotal_tax: string;

  @IsString()
  total: string;

  @IsString()
  total_tax: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxLineDto)
  taxes: TaxLineDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaDataDto)
  meta_data: MetaDataDto[];

  @IsString()
  @IsOptional()
  sku: string;

  @IsString()
  price: string;
}

// Order properties
export class WooCommerceOrderDto {
  @IsNumber()
  id: number;

  @IsNumber()
  parent_id: number;

  @IsString()
  number: string;

  @IsString()
  order_key: string;

  @IsString()
  created_via: string;

  @IsString()
  version: string;

  @IsString()
  status: string;

  @IsString()
  currency: string;

  @IsDateString()
  date_created: string;

  @IsDateString()
  date_created_gmt: string;

  @IsDateString()
  date_modified: string;

  @IsDateString()
  date_modified_gmt: string;

  @IsString()
  discount_total: string;

  @IsString()
  discount_tax: string;

  @IsOptional()
  @IsString()
  shipping_total: string;

  @IsString()
  shipping_tax: string;

  @IsString()
  cart_tax: string;

  @IsOptional()
  @IsString()
  total: string;

  @IsString()
  total_tax: string;

  @IsBoolean()
  prices_include_tax: boolean;

  @IsNumber()
  @IsOptional()
  customer_id: number;

  @IsString()
  customer_ip_address: string;

  @IsString()
  customer_user_agent: string;

  @IsString()
  @IsOptional()
  customer_note: string;

  @IsObject()
  @ValidateNested()
  @Type(() => BillingDto)
  billing: BillingDto;

  @IsObject()
  @ValidateNested()
  @Type(() => ShippingDto)
  shipping: ShippingDto;

  @IsString()
  @IsOptional()
  payment_method: string;

  @IsString()
  @IsOptional()
  payment_method_title: string;

  @IsString()
  @IsOptional()
  transaction_id: string;

  @IsDateString()
  @IsOptional()
  date_paid: string;

  @IsDateString()
  @IsOptional()
  date_paid_gmt: string;

  @IsDateString()
  @IsOptional()
  date_completed: string;

  @IsDateString()
  @IsOptional()
  date_completed_gmt: string;

  @IsString()
  @IsOptional()
  cart_hash: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaDataDto)
  meta_data: MetaDataDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  line_items: LineItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxLineDto)
  tax_lines: TaxLineDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingLineDto)
  shipping_lines: ShippingLineDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeeLineDto)
  fee_lines: FeeLineDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CouponLineDto)
  coupon_lines: CouponLineDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RefundDto)
  refunds: RefundDto[];

  @IsBoolean()
  @IsOptional()
  set_paid: boolean;

  @IsOptional()
  @IsString()
  payment_url: string;

  @IsOptional()
  @IsBoolean()
  needs_payment: boolean;

  @IsOptional()
  @IsBoolean()
  needs_processing: boolean;

  @IsOptional()
  @IsString()
  currency_symbol: string;

  @ValidateNested()
  @Type(() => OrderLinksDto)
  _links: OrderLinksDto;
}
