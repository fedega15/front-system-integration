import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

class StockQty {
  @Prop({ required: true })
  stockId: number;

  @Prop({ required: true })
  qty: number;
}

class Identifier {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  type: string;
}

class ProductSize {
  @Prop({ required: true })
  identity: string;

  @Prop({ required: true })
  gtin: string;

  @Prop({ required: true })
  label: string;

  @Prop({ type: [StockQty], default: [] })
  stockQty: StockQty[];

  @Prop({ type: [Identifier], default: [] })
  identifiers: Identifier[];
}

export type FSProductDocument = HydratedDocument<FSProduct>;

@Schema({ timestamps: true })
export class FSProduct extends Document {
  @Prop({ required: true, unique: true })
  productid: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  number: string;

  @Prop()
  variant: string;

  @Prop()
  groupName: string;

  @Prop()
  subgroupName: string;

  @Prop()
  color: string;

  @Prop()
  season: string;

  @Prop()
  brand: string;

  @Prop()
  gender: string;

  @Prop({ default: false })
  isDiscontinued: boolean;

  @Prop()
  tags: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  upt: string;

  @Prop()
  description: string;

  @Prop()
  internalDescription: string;

  @Prop({ default: false })
  isStockProduct: boolean;

  @Prop()
  pictureRef: string;

  @Prop({ default: false })
  isWebAvailable: boolean;

  @Prop({ type: [ProductSize], default: [] })
  productSizes: ProductSize[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  cost: number;
}

export const FSProductSchema = SchemaFactory.createForClass(FSProduct);
