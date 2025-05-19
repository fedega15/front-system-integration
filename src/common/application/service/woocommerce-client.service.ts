import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { WooCommerceCredentials } from '@/modules/woocommerce/application/service/woocommerce-base.service';
import { isAxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

@Injectable()
export class WoocommerceHttpClientService {
  private readonly apiUrl: string;

  constructor(private environmentConfig: ConfigService) {
    this.apiUrl = this.environmentConfig.get<string>('woocommerce.apiUrl');

    if (!this.apiUrl) {
      throw new Error('WooCommerce API URL is missing');
    }
  }

  private createClient(credentials: WooCommerceCredentials): AxiosInstance {
    return axios.create({
      baseURL: this.apiUrl,
      auth: {
        username: credentials.consumerKey,
        password: credentials.consumerSecret,
      },
    });
  }

  async get<T>(url: string, credentials: WooCommerceCredentials): Promise<T> {
    try {
      const client = this.createClient(credentials);
      const response = await client.get<T>(url);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        this.handleError(error);
      } else {
        this.handleError(new AxiosError('Unknown error'));
      }
    }
  }

  async post<T>(
    url: string,
    data: any,
    credentials: WooCommerceCredentials,
  ): Promise<T> {
    try {
      const client = this.createClient(credentials);
      const response = await client.post<T>(url, data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        this.handleError(error);
      } else {
        this.handleError(new AxiosError('Unknown error'));
      }
    }
  }

  async put<T>(
    url: string,
    data: any,
    credentials: WooCommerceCredentials,
  ): Promise<T> {
    try {
      const client = this.createClient(credentials);
      const response = await client.put<T>(url, data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        this.handleError(error);
      } else {
        this.handleError(new AxiosError('Unknown error'));
      }
    }
  }

  async delete<T>(
    url: string,
    credentials: WooCommerceCredentials,
  ): Promise<T> {
    try {
      const client = this.createClient(credentials);
      const response = await client.delete<T>(url);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        this.handleError(error);
      } else {
        this.handleError(new AxiosError('Unknown error'));
      }
    }
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      const status = error.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        (error.response.data as ErrorResponse)?.message ||
        'Error al comunicarse con WooCommerce';
      throw new HttpException(message, status);
    } else {
      throw new HttpException(
        'Ocurrió un error inesperado',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
