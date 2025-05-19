import { Store } from '@/modules/front-systems/store/infrastructure/schema/store.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type FSCompanyDocument = HydratedDocument<Company>;

@Schema({ timestamps: true })
export class Company extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['admin', 'company'] })
  role: string;

  @Prop({ required: true })
  LegalName: string;

  @Prop({ required: true })
  Orgnum: string;

  @Prop({ required: true })
  FsSubscriptionKey: string;

  @Prop({ required: true })
  FsApiKey: string;

  @Prop({ required: true })
  WooCommerceConsumerKey: string;

  @Prop({ required: true })
  WooCommerceConsumerSecret: string;

  @Prop()
  stores: Store[];
}

export const CompanySchema = SchemaFactory.createForClass(Company);
