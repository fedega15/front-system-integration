import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CoreService {
  private readonly apiUrl: string;
  private readonly subscriptionKey: string;
  private readonly apiKey: string;

  constructor(private environmentConfig: ConfigService) {
    this.apiUrl = this.environmentConfig.get<string>('frontsystems.apiUrl');
    this.subscriptionKey = this.environmentConfig.get<string>(
      'frontsystems.suscription_key',
    );
    this.apiKey = this.environmentConfig.get<string>('frontsystems.api_key');
  }

  async createOrder(): Promise<any> {
    const response = await axios.get(`${this.apiUrl}/products`, {
      headers: {
        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        'x-api-key': this.apiKey,
      },
    });
    return response.data;
  }

  async getProducts(): Promise<any> {
    const response = await axios.get(`${this.apiUrl}/products`, {
      headers: {
        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        'x-api-key': this.apiKey,
      },
    });
    return response.data;
  }

  async updateStock(productId: string, stock: number): Promise<any> {
    const response = await axios.put(
      `${this.apiUrl}/stock/${productId}`,
      { stock },
      {
        headers: {
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'x-api-key': this.apiKey,
        },
      },
    );
    return response.data;
  }

  // Suscripcion a WEBHOOKS
  async subscribeToWebhooks(webhookUrl: string): Promise<any> {
    const response = await axios.post(
      `${this.apiUrl}/api/webhooks`,
      {
        event: 'StockMovementCreated', // Ejemplo: Suscribirse a actualizaciones de stock
        url: webhookUrl, // URL de tu endpoint de webhooks
      },
      {
        headers: {
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'x-api-key': this.apiKey,
        },
      },
    );
    return response.data;
  }
}
