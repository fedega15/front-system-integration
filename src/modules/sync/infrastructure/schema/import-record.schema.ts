import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type ImportRecordDocument = HydratedDocument<ImportRecord>;

@Schema({ timestamps: true })
export class ImportRecord extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  companyId: string;

  @Prop({ required: true })
  totalProducts: number;

  @Prop({ required: true })
  importedProducts: number;

  @Prop({ required: true })
  skippedProducts: number;

  @Prop({ required: true })
  duplicatedProducts: number;

  @Prop({ type: [{ id: String, name: String, reason: String }], default: [] })
  skippedDetails: { id: string; name: string; reason: string }[];

  @Prop({ type: [{ id: String, name: String }], default: [] })
  duplicatedDetails: { id: string; name: string }[];

  @Prop({ type: [{ id: String, name: String }], default: [] })
  importedDetails: { id: string; name: string }[];

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ required: true })
  status: 'success' | 'error' | 'partial';

  @Prop()
  error?: string;
}

export const ImportRecordSchema = SchemaFactory.createForClass(ImportRecord); 