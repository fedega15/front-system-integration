import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class Link {
  @Prop({ required: true })
  href: string;

  @Prop({ type: Object, required: false })
  targetHints?: {
    allow: string[];
  };
}

class Links {
  @Prop({ type: [Link], required: true })
  self: Link[];

  @Prop({ type: [Link], required: true })
  collection: Link[];

  @Prop({ type: [Link], required: false })
  up?: Link[];
}

class Category {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;
}

class Image {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  date_created: string;

  @Prop({ required: true })
  date_created_gmt: string;

  @Prop({ required: true })
  date_modified: string;

  @Prop({ required: true })
  date_modified_gmt: string;

  @Prop({ required: true })
  src: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  alt: string;
}

class Attribute {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  position: number;

  @Prop({ required: true })
  visible: boolean;

  @Prop({ required: true })
  variation: boolean;

  @Prop({ type: [String], required: true })
  options: string[];
}

class MetaData {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  key: string;

  @Prop()
  value: string;
}

class Dimensions {
  @Prop({ required: true })
  length: string;

  @Prop({ required: true })
  width: string;

  @Prop({ required: true })
  height: string;
}

@Schema({ timestamps: true })
export class WcProduct extends Document {
  @Prop({ required: true, unique: true })
  declare id: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  slug: string;

  @Prop({ required: true })
  permalink: string;

  @Prop({ required: true })
  date_created: string;

  @Prop({ required: false })
  date_created_gmt: string;

  @Prop({ required: true })
  date_modified: string;

  @Prop({ required: false })
  date_modified_gmt: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: false })
  featured: boolean;

  @Prop({ required: false })
  catalog_visibility: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  short_description: string;

  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  price: string;

  @Prop()
  regular_price: string;

  @Prop()
  sale_price: string;

  @Prop({ required: false })
  date_on_sale_from: string;

  @Prop({ required: false })
  date_on_sale_from_gmt: string;

  @Prop({ required: false })
  date_on_sale_to: string;

  @Prop({ required: false })
  date_on_sale_to_gmt: string;

  @Prop({ required: true })
  on_sale: boolean;

  @Prop({ required: true })
  purchasable: boolean;

  @Prop({ required: true })
  total_sales: number;

  @Prop({ required: true })
  virtual: boolean;

  @Prop({ required: false })
  downloadable: boolean;

  @Prop({ default: [] })
  downloads: any[];

  @Prop({ required: false })
  download_limit: number;

  @Prop({ required: false })
  download_expiry: number;

  @Prop()
  external_url: string;

  @Prop({ required: false })
  button_text: string;

  @Prop({ required: false })
  tax_status: string;

  @Prop({ required: false })
  tax_class: string;

  @Prop({ required: true })
  manage_stock: boolean;

  @Prop({ required: false })
  stock_quantity: number;

  @Prop({ required: false })
  backorders: string;

  @Prop({ required: false })
  backorders_allowed: boolean;

  @Prop({ required: false })
  backordered: boolean;

  @Prop({ required: false })
  low_stock_amount: number;

  @Prop({ required: false })
  sold_individually: boolean;

  @Prop({ required: false })
  weight: string;

  @Prop({ type: Dimensions, required: true })
  dimensions: Dimensions;

  @Prop()
  shipping_required: boolean;

  @Prop({ required: false })
  shipping_taxable: boolean;

  @Prop({ required: false })
  shipping_class: string;

  @Prop({ required: false })
  shipping_class_id: number;

  @Prop({ required: false })
  reviews_allowed: boolean;

  @Prop({ required: false })
  average_rating: string;

  @Prop({ required: false })
  rating_count: number;

  @Prop({ type: [Number], default: [] })
  upsell_ids: number[];

  @Prop({ type: [Number], default: [] })
  cross_sell_ids: number[];

  @Prop({ required: true })
  parent_id: number;

  @Prop()
  purchase_note: string;

  @Prop({ type: [Category], default: [] })
  categories: Category[];

  @Prop({ default: [] })
  tags: any[];

  @Prop({ type: [Image], default: [] })
  images: Image[];

  @Prop({ type: [Attribute], default: [] })
  attributes: Attribute[];

  @Prop({ default: [] })
  default_attributes: any[];

  @Prop({ type: [Number], default: [] })
  variations: number[];

  @Prop({ default: [] })
  grouped_products: any[];

  @Prop({ required: false })
  menu_order: number;

  @Prop({ required: false })
  price_html: string;

  @Prop({ type: [Number], default: [] })
  related_ids: number[];

  @Prop({ type: [MetaData], default: [] })
  meta_data: MetaData[];

  @Prop({ required: true })
  stock_status: string;

  @Prop({ required: false })
  has_options: boolean;

  @Prop()
  post_password: string;

  @Prop()
  global_unique_id: string;

  @Prop()
  brands: any[];

  @Prop({ type: Links, required: false })
  _links: Links;
}
export const ProductSchema = SchemaFactory.createForClass(WcProduct);
