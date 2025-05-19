import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class Tax {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  total: string;

  @Prop({ required: true })
  subtotal: string;
}

class MetaData {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  value: string;
}

class LineItem {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  product_id: number;

  @Prop({ default: 0 })
  variation_id: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  subtotal: string;

  @Prop({ required: true })
  subtotal_tax: string;

  @Prop({ required: true })
  total: string;

  @Prop({ required: true })
  total_tax: string;

  @Prop({ type: [Tax], default: [] })
  taxes: Tax[];

  @Prop({ type: [MetaData], default: [] })
  meta_data: MetaData[];

  @Prop()
  sku: string;

  @Prop({ required: true })
  price: number;
}

class Address {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop()
  company: string;

  @Prop({ required: true })
  address_1: string;

  @Prop()
  address_2: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  postcode: string;

  @Prop({ required: true })
  country: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;
}

@Schema({ timestamps: true })
export class WCOrder extends Document {
  @Prop()
  declare id: number;

  @Prop()
  number: string;

  @Prop()
  order_key: string;

  @Prop()
  created_via: string;

  @Prop()
  version: string;

  @Prop()
  status: string;

  @Prop()
  currency: string;

  @Prop()
  date_created: string;

  @Prop()
  date_created_gmt: string;

  @Prop()
  date_modified: string;

  @Prop()
  date_modified_gmt: string;

  @Prop()
  discount_total: string;

  @Prop()
  discount_tax: string;

  @Prop()
  shipping_total: string;

  @Prop()
  shipping_tax: string;

  @Prop()
  cart_tax: string;

  @Prop()
  total: string;

  @Prop()
  total_tax: string;

  @Prop({ default: false })
  prices_include_tax: boolean;

  @Prop()
  customer_id: number;

  @Prop()
  customer_ip_address: string;

  @Prop()
  customer_user_agent: string;

  @Prop()
  customer_note: string;

  @Prop()
  billing: Address;

  @Prop()
  shipping: Address;

  @Prop()
  payment_method: string;

  @Prop()
  payment_method_title: string;

  @Prop()
  transaction_id: string;

  @Prop()
  date_paid: string;

  @Prop()
  date_paid_gmt: string;

  @Prop()
  date_completed: string;

  @Prop()
  date_completed_gmt: string;

  @Prop()
  cart_hash: string;

  @Prop({ type: [MetaData], default: [], required: true })
  meta_data: MetaData[];

  @Prop({ type: [LineItem], default: [] })
  line_items: LineItem[];
}

export const WCOrderSchema = SchemaFactory.createForClass(WCOrder);
