import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WebhookConfig extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  topic: string;

  @Prop({ required: false })
  secret: string;

  @Prop({ required: true })
  wooCommerceWebhookId: number;

  @Prop({ required: true })
  deliveryUrl: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastDeliveryAttempt?: Date;

  @Prop()
  lastDeliveryStatus?: string;
}

export const WebhookConfigSchema = SchemaFactory.createForClass(WebhookConfig);
