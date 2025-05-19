import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SalesReportingResponseDto } from '../dto/sales-reporting-response.dto';
import { mapToSalesReportingDto } from '../mapper/sales-reporting.mapper';

@Injectable()
export class SalesReportingService {
  private readonly odataUrl: string;

  constructor(private configService: ConfigService) {
    this.odataUrl = this.configService.get<string>('FRONT_SYSTEMS_ODATA_URL');
  }

  async getSalesReport(user: any): Promise<SalesReportingResponseDto[]> {
    const endpoint = `${this.odataUrl}/SalesV2?select=72687971`;
    const response = await axios.get(endpoint, {
      headers: {
        Accept: 'application/json',
        'Ocp-Apim-Subscription-Key': user.apiKeys.frontSystem.subscriptionKey,
        'x-api-key': user.apiKeys.frontSystem.apiKey,
      },
      responseType: 'json',
    });

    if (response.data && Array.isArray(response.data.value)) {
      return response.data.value.map(mapToSalesReportingDto);
    }

    throw new Error('FrontSystems API error: ' + JSON.stringify(response.data));
  }
} 