import { Injectable, Logger } from '@nestjs/common';
import { FrontSystemsHttpClientService } from '@/common/application/service/front-systems-client.service';
import { FrontSystemsOrderDto } from '../dto';
import * as uuid from 'uuid';

interface User {
  FsSubscriptionKey?: string;
  FsApiKey?: string;
  apiKeys?: {
    frontSystem?: {
      subscriptionKey: string;
      apiKey: string;
    };
  };
}

interface FrontSystemsCustomer {
  customerId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: {
    address1: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

@Injectable()
export class FsOrderService {
  private readonly logger = new Logger(FsOrderService.name);

  constructor(
    private readonly frontSystemsClient: FrontSystemsHttpClientService,
  ) {}

  private async getCustomerId(user: User, email: string, order: FrontSystemsOrderDto): Promise<number> {
    try {
      const response = await this.frontSystemsClient.post<FrontSystemsCustomer[]>(
        '/Customer',
        user,
        { email, pageSize: 1, pageSkip: 0 }
      );

      if (response && Array.isArray(response) && response.length > 0) {
        this.logger.debug(`Found existing customer with ID: ${response[0].customerId}`);
        return response[0].customerId;
      }

      this.logger.debug('Customer not found, creating new customer...');

      const newCustomer = await this.frontSystemsClient.post<FrontSystemsCustomer>(
        '/Customer',
        user,
        {
          email,
          firstName: order.customer.firstName,
          lastName: order.customer.lastName,
          phone: order.customer.phone,
          address1: order.customer.address.address1,
          city: order.customer.address.city,
          postalCode: order.customer.address.postalCode,
          country: order.customer.address.country
        }
      );

      this.logger.debug(`Created new customer with ID: ${newCustomer.customerId}`);
      return newCustomer.customerId;
    } catch (error) {
      this.logger.error('Error getting/creating customer:', error);
      this.logger.warn('Using default customer ID (1) for the sale');
      return 1; 
    }
  }

  async createOrder(
    user: User,
    order: FrontSystemsOrderDto,
    stockId: string,
  ): Promise<any> {
    try {
      // Forzar el StoreId del Webshop en el header (por ejemplo, 4821)
      const WEBSHOP_STORE_ID = '4821';
      const requestConfig = {
        headers: {
          'X-StoreId': WEBSHOP_STORE_ID,
        },
      };

      // Hardcodear customerID para pruebas
      const customerId = 9041955;

      // Convert orderLines to salesLines format, usando stockID físico en cada línea
      const salesLines = order.orderLines.map(line => ({
        identity: line.gtin,
        text: line.receiptLabel,
        price: line.price,
        qty: line.quantity,
        stockID: line.stockId, // stockID físico, en mayúsculas
        vat: line.vat,
      }));

      const salePayload = {
        saleGuid: uuid.v4(),
        extRef: order.orderId.toString(),
        customerID: customerId, // Hardcodeado para pruebas
        saleDateTime: order.createdDateTime,
        isComplete: true,
        isVoided: false,
        comment: order.comment || '',
        salesLines,
        paymentLines: order.paymentLines.map(payment => ({
          extRef: payment.txRef || '',
          currency: payment.currency,
          amount: payment.amount,
          paymentType: 1, // 1 = card
          cardType: 2, // 2 = Visa
          responseBody: '',
        })),
      };

      this.logger.debug('Sending sale to Front Systems:', {
        storeId: order.store.storeExtId,
        stockId,
        customerId,
        saleGuid: salePayload.saleGuid,
        salesLines: salePayload.salesLines
      });

      // Usar el endpoint correcto '/Sale' (mayúscula S) y método PUT
      const response = await this.frontSystemsClient.put(
        '/Sale',
        user,
        salePayload,
        requestConfig,
      );
      return response;
    } catch (error) {
      this.logger.error('Error creating order:', error);
      throw error;
    }
  }
}
