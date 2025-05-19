import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema()
export class Store extends Document {
  @Prop({ required: true, unique: true })
  StoreId: number;

  @Prop()
  StoreNo?: string;

  @Prop({ required: true })
  LegalName: string;

  @Prop({ required: true })
  Orgnum: string;

  @Prop({ required: true })
  StoreName: string;

  @Prop()
  Address?: string;

  @Prop()
  PostalCode?: string;

  @Prop()
  City?: string;

  @Prop({ required: true })
  Country: string;

  @Prop({ required: true })
  CountryCode: string;

  @Prop()
  Email?: string;

  @Prop()
  Web?: string;

  @Prop()
  Phone?: string;

  @Prop({ required: true })
  StockId: number;

  @Prop()
  ExternalStockId?: string;

  @Prop({ required: true })
  Currency: string;

  @Prop({ required: true })
  TimeZone: string;

  @Prop({ required: true })
  TimeZoneInfo: string;

  @Prop()
  RetailPricelistID?: string;

  @Prop()
  PricelistID?: string;
}

export const StoreSchema = SchemaFactory.createForClass(Store);
