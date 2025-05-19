import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class StockMovement extends Document {
  @Prop({ required: true })
  movementId: number;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  gtin: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  stockLevel: number;

  @Prop({ required: true })
  reservedLevel: number;

  @Prop({ required: true })
  availableLevel: number;

  @Prop({ required: true })
  stockId: number;

  @Prop({ required: false })
  storeId: string;

  @Prop({ required: true })
  createdById: string;

  @Prop({ required: true })
  createdDateTime: Date;

  @Prop()
  productName?: string;

  @Prop()
  orderId?: string;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement); 