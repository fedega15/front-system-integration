import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// Definición de Address
class Address {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  address1: string;

  @IsOptional()
  @IsString()
  address2: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  province: string;

  @IsOptional()
  @IsString()
  postalCode: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  countryCode: string;

  @IsOptional()
  @IsString()
  comment: string;
}

class StoreAddress {
  @IsOptional()
  @IsString()
  address1: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  postalCode: string;
}

// Definición de ShipmentItem
class ShipmentItem {
  @IsOptional()
  @IsString()
  rowId: string;

  @IsOptional()
  @IsString()
  gtin: string;

  @IsOptional()
  @IsString()
  externalSKU: string;
}

// Definición de ShipmentDetails
class ShipmentDetails {
  @IsOptional()
  @IsString()
  id: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  shipmentInfo: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentItem)
  items: ShipmentItem[];
}

// Definición de FulfillmentLocation
class FulfillmentLocation {
  @IsOptional()
  @IsNumber()
  stockId: number;

  @IsOptional()
  @IsString()
  stockName: string;

  @IsOptional()
  @IsNumber()
  posId: number;

  @IsOptional()
  @IsNumber()
  personId: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Address)
  deliveryAddress: Address;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  shipmentInfo: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentDetails)
  shipments: ShipmentDetails[];
}

// Definición de Customer
class Customer {
  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  taxId: string;

  @IsOptional()
  @IsString()
  phoneCountryPrefix: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Address)
  address: Address;
}

// Definición de OrderLine
class OrderLine {
  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  gtin: string;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  vat: number;

  @IsOptional()
  @IsNumber()
  vatPercent: number;

  @IsOptional()
  @IsNumber()
  fullPrice: number;

  @IsOptional()
  @IsNumber()
  discount: number;

  @IsOptional()
  @IsNumber()
  discountPercent: number;

  @IsOptional()
  @IsString()
  sizeText: string;

  @IsOptional()
  @IsString()
  rowId: string;

  @IsOptional()
  @IsString()
  externalSKU: string;

  @IsOptional()
  @IsString()
  receiptLabel: string;

  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsBoolean()
  shipFromOnlineStore: boolean;

  @IsOptional()
  @IsNumber()
  stockId?: number;
}

// Definición de PaymentLine
class PaymentLine {
  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  subType: string;

  @IsOptional()
  @IsString()
  currency: string;

  @IsOptional()
  @IsNumber()
  currencyTendered: number;

  @IsOptional()
  @IsString()
  txRef: string;

  @IsOptional()
  @IsString()
  text: string;

  @IsOptional()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  rowId: string;
}

// Definición de Store
class Store {
  @IsOptional()
  @IsString()
  storeExtId: string;

  @IsOptional()
  @IsString()
  storeName: string;

  @IsOptional()
  @IsNumber()
  posId: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StoreAddress)
  address: StoreAddress;
}

// Definición del DTO principal FrontSystemsOrderDto
export class FrontSystemsOrderDto {
  @IsOptional()
  @IsString()
  receiptNo: string;

  @IsOptional()
  @IsString()
  receiptFormatted: string;

  @IsOptional()
  @IsString()
  receiptUrl: string;

  @IsOptional()
  @IsNumber()
  orderId: number;

  @IsOptional()
  @IsString()
  orderNo: string;

  @IsOptional()
  @IsString()
  orderType: string;

  @IsOptional()
  @IsString()
  createdDateTime: string;

  @IsOptional()
  @IsString()
  updatedDateTime: string;

  @IsOptional()
  @IsString()
  dueDateTime: string;

  @IsOptional()
  @IsString()
  expirationDateTime: string;

  @IsOptional()
  @IsString()
  comment: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentLine)
  paymentLines: PaymentLine[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderLine)
  orderLines: OrderLine[];

  @IsOptional()
  @IsArray()
  orderEvents: any[];

  @IsOptional()
  @IsString()
  shipmentInfo: string;

  @IsOptional()
  @IsNumber()
  reservationLengthInHours: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => FulfillmentLocation)
  fulfillmentLocation: FulfillmentLocation;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Store)
  store: Store;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Customer)
  customer: Customer;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Address)
  shippingAddress: Address;

  @IsOptional()
  @IsNumber()
  vatTotal: number;

  @IsOptional()
  @IsNumber()
  total: number;

  @IsOptional()
  @IsString()
  status: string;
}
