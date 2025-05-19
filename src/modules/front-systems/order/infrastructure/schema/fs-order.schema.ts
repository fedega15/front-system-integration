import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// Definición de Address
@Schema({ _id: false }) // _id: false para evitar que Mongoose genere un _id automático
class Address {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  companyName: string;

  @Prop()
  address1: string;

  @Prop()
  address2: string;

  @Prop()
  city: string;

  @Prop()
  province: string;

  @Prop()
  postalCode: string;

  @Prop()
  country: string;

  @Prop()
  countryCode: string;

  @Prop()
  comment: string;
}

// Definición de ShipmentItem
@Schema({ _id: false })
class ShipmentItem {
  @Prop()
  rowId: string;

  @Prop()
  gtin: string;

  @Prop()
  externalSKU: string;
}

// Definición de ShipmentDetails
@Schema({ _id: false })
class ShipmentDetails {
  @Prop()
  id: string;

  @Prop({ type: [String] })
  shipmentInfo: string[];

  @Prop({ type: [ShipmentItem] })
  items: ShipmentItem[];
}

// Definición de FulfillmentLocation
@Schema({ _id: false })
class FulfillmentLocation {
  @Prop()
  stockId: number;

  @Prop()
  stockName: string;

  @Prop()
  posId: number;

  @Prop()
  personId: number;

  @Prop({ type: Address })
  deliveryAddress: Address;

  @Prop({ type: [String] })
  shipmentInfo: string[];

  @Prop({ type: [ShipmentDetails] })
  shipments: ShipmentDetails[];
}

// Definición de Customer
@Schema({ _id: false })
class Customer {
  @Prop()
  email: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  companyName: string;

  @Prop()
  taxId: string;

  @Prop()
  phoneCountryPrefix: string;

  @Prop()
  phone: string;

  @Prop({ type: Address })
  address: Address;
}

// Definición de OrderLine
@Schema({ _id: false })
class OrderLine {
  @Prop()
  quantity: number;

  @Prop()
  gtin: string;

  @Prop()
  price: number;

  @Prop()
  vat: number;

  @Prop()
  vatPercent: number;

  @Prop()
  fullPrice: number;

  @Prop()
  discount: number;

  @Prop()
  discountPercent: number;

  @Prop()
  sizeText: string;

  @Prop()
  rowId: string;

  @Prop()
  externalSKU: string;

  @Prop()
  receiptLabel: string;

  @Prop()
  status: string;

  @Prop()
  shipFromOnlineStore: boolean;
}

// Definición de PaymentLine
@Schema({ _id: false })
class PaymentLine {
  @Prop()
  type: string;

  @Prop()
  subType: string;

  @Prop()
  currency: string;

  @Prop()
  currencyTendered: number;

  @Prop()
  txRef: string;

  @Prop()
  text: string;

  @Prop()
  amount: number;

  @Prop()
  rowId: string;
}

// Definición de Store
@Schema({ _id: false })
class Store {
  @Prop()
  storeExtId: string;

  @Prop()
  storeName: string;

  @Prop()
  organizationNumber: string;

  @Prop()
  posId: number;

  @Prop()
  posName: string;

  @Prop()
  salesPerson: string;

  @Prop()
  currency: string;

  @Prop({ type: Address })
  address: Address;
}

// Definición del esquema principal FsOrder
@Schema({ timestamps: true })
export class FsOrder extends Document {
  @Prop()
  receiptNo: string;

  @Prop()
  receiptFormatted: string;

  @Prop()
  receiptUrl: string;

  @Prop()
  orderId: number;

  @Prop()
  orderNo: string;

  @Prop()
  orderType: string;

  @Prop()
  createdDateTime: string;

  @Prop()
  updatedDateTime: string;

  @Prop()
  dueDateTime: string;

  @Prop()
  expirationDateTime: string;

  @Prop()
  comment: string;

  @Prop({ type: [PaymentLine] })
  paymentLines: PaymentLine[];

  @Prop({ type: [OrderLine] })
  orderLines: OrderLine[];

  @Prop({ type: [] }) // Define el tipo de OrderEvent si es necesario
  orderEvents: any[];

  @Prop()
  shipmentInfo: string;

  @Prop()
  reservationLengthInHours: number;

  @Prop({ type: FulfillmentLocation }) // Especifica el tipo explícitamente
  fulfillmentLocation: FulfillmentLocation;

  @Prop({ type: Store })
  store: Store;

  @Prop({ type: Customer })
  customer: Customer;

  @Prop({ type: Address })
  shippingAddress: Address;

  @Prop()
  vatTotal: number;

  @Prop()
  total: number;

  @Prop()
  status: string;
}

export const FsOrderSchema = SchemaFactory.createForClass(FsOrder);
