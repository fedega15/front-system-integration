import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['admin', 'company'] })
  role: string;

  @Prop()
  LegalName: string;

  @Prop({ unique: true })
  Orgnum: string;

  @Prop()
  FsSubscriptionKey: string;

  @Prop()
  FsApiKey: string;

  @Prop()
  WooCommerceConsumerKey: string;

  @Prop()
  WooCommerceConsumerSecret: string;

  @Prop()
  WooCommerceUrl: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
