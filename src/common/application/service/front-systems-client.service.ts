import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError, isAxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

interface FrontSystemsConfig {
  subscriptionKey: string;
  apiKey: string;
}

interface UserWithApiKeys {
  FsSubscriptionKey?: string;
  FsApiKey?: string;
  apiKeys?: {
    frontSystem?: {
      subscriptionKey: string;
      apiKey: string;
    };
  };
}

@Injectable()
export class FrontSystemsHttpClientService {
  private readonly apiUrl: string;
  private readonly logger = new Logger(FrontSystemsHttpClientService.name);

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('frontsystems.apiUrl');
    if (!this.apiUrl) {
      throw new Error('Front Systems API URL is missing');
    }
    this.logger.debug(`Front Systems API URL: ${this.apiUrl}`);
  }

  private createClient(config: FrontSystemsConfig): AxiosInstance {
    if (!config.subscriptionKey || !config.apiKey) {
      throw new HttpException(
        'Front Systems API keys are missing',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Ocp-Apim-Subscription-Key': config.subscriptionKey,
        'x-api-key': config.apiKey,
      },
    });

    // Add request interceptor for logging
    client.interceptors.request.use((config) => {
      this.logger.debug(
        `Making ${config.method.toUpperCase()} request to ${config.url}`,
      );
      this.logger.debug('Request headers:', config.headers);
      if (config.data) {
        this.logger.debug('Request data:', config.data);
      }
      return config;
    });

    // Add response interceptor for logging
    client.interceptors.response.use(
      (response) => {
        this.logger.debug(`Received response from ${response.config.url}`);
        this.logger.debug('Response status:', response.status);
        return response;
      },
      (error) => {
        this.logger.error(
          `Error in request to ${error.config?.url}:`,
          error.message,
        );
        if (error.response) {
          this.logger.error('Response data:', error.response.data);
        }
        return Promise.reject(error);
      },
    );

    return client;
  }

  getFrontSystemsConfig(user: UserWithApiKeys): FrontSystemsConfig {
    // Try to get API keys from the new format first
    if (user.apiKeys?.frontSystem) {
      return {
        subscriptionKey: user.apiKeys.frontSystem.subscriptionKey,
        apiKey: user.apiKeys.frontSystem.apiKey,
      };
    }

    // Fall back to the old format
    if (user.FsSubscriptionKey && user.FsApiKey) {
      return {
        subscriptionKey: user.FsSubscriptionKey,
        apiKey: user.FsApiKey,
      };
    }

    throw new HttpException(
      'Front Systems API keys are missing',
      HttpStatus.UNAUTHORIZED,
    );
  }

  async get<T>(
    url: string,
    user: UserWithApiKeys,
    requestConfig?: any,
  ): Promise<T> {
    try {
      const client = this.createClient(this.getFrontSystemsConfig(user));
      const response = await client.get<T>(url, requestConfig);
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
    user: UserWithApiKeys,
    data?: any,
    requestConfig?: any,
  ): Promise<T> {
    try {
      const client = this.createClient(this.getFrontSystemsConfig(user));
      const response = await client.post<T>(url, data, requestConfig);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        this.logger.error('Error in post request:', error.response);
        this.handleError(error);
      } else {
        this.logger.error('Error in post request:', error);
        this.handleError(new AxiosError('Unknown error'));
      }
    }
  }

  async put<T>(
    url: string,
    user: UserWithApiKeys,
    data?: any,
    requestConfig?: any,
  ): Promise<T> {
    try {
      const client = this.createClient(this.getFrontSystemsConfig(user));
      const response = await client.put<T>(url, data, requestConfig);
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
    user: UserWithApiKeys,
    requestConfig?: any,
  ): Promise<T> {
    try {
      const client = this.createClient(this.getFrontSystemsConfig(user));
      const response = await client.delete<T>(url, requestConfig);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        this.handleError(error);
      } else {
        this.handleError(new AxiosError('Unknown error'));
      }
    }
  }

  private handleError(error: AxiosError): void {
    if (error.response) {
      const errorResponse = error.response.data as ErrorResponse;
      this.logger.error('Front Systems API Error:', {
        status: error.response.status,
        message: errorResponse.message,
        data: error.response.data,
      });
      throw new HttpException(
        errorResponse.message || 'Error from Front Systems API',
        error.response.status,
      );
    }
    this.logger.error('Front Systems Connection Error:', error.message);
    throw new HttpException(
      'Error connecting to Front Systems API',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

