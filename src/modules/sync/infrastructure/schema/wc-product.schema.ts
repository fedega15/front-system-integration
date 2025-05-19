import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type WCProductDocument = HydratedDocument<WCProduct>;

@Schema({ timestamps: true, _id: true })
export class WCProduct extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  companyId: string;

  @Prop({ required: true, unique: true })
  wcId: number;

  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  description: string;

  @Prop()
  shortDescription: string;

  @Prop({ type: [{ id: Number, name: String }], default: [] })
  categories: { id: number; name: string }[];

  @Prop({ type: [{ src: String, alt: String }], default: [] })
  images: { src: string; alt: string }[];

  @Prop({ type: [{ name: String }], default: [] })
  tags: { name: string }[];

  @Prop({ type: [{ name: String, options: [String] }], default: [] })
  attributes: { name: string; options: string[] }[];

  @Prop({ type: [{ key: String, value: String }], default: [] })
  metaData: { key: string; value: string }[];

  @Prop({ required: true })
  status: string;

  @Prop()
  price: string;

  @Prop({ required: true })
  importedAt: Date;
}

export const WCProductSchema = SchemaFactory.createForClass(WCProduct);

// Eliminar todos los índices existentes
WCProductSchema.index({ id: 1 }, { unique: false, sparse: true });

// Asegurar que wcId sea único
WCProductSchema.index({ wcId: 1 }, { unique: true }); 