import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import {
  FSStockFilterRequestDto,
  FSStockResponseDto,
  StockCountFilterDTO,
  StockCountResponseDTO,
  StockQuantityDTO,
  StockReservationItemDto,
  StockReservationRequestDto,
  StockReservationResponseDto,
} from '../dto';
import { FrontSystemsHttpClientService } from '@/common/application/service/front-systems-client.service';

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

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    private readonly frontSystemsClient: FrontSystemsHttpClientService,
  ) {}

  private getFrontSystemsConfig(user: User) {
    return {
      subscriptionKey: user.FsSubscriptionKey,
      apiKey: user.FsApiKey,
    };
  }

  async getStockQuantityCount(
    user: User,
    filter?: StockCountFilterDTO,
  ): Promise<StockCountResponseDTO> {
    try {
      const response =
        await this.frontSystemsClient.post<StockCountResponseDTO>(
          '/Stock/Count',
          user,
          filter,
        );
      return response;
    } catch (error) {
      this.logger.error('Error getting stock count:', error);
      throw error;
    }
  }

  async getStockQuantityByGTIN(
    user: User,
    gtin: string,
  ): Promise<StockQuantityDTO[]> {
    try {
      const response = await this.frontSystemsClient.get<StockQuantityDTO[]>(
        `/Stock/GTIN/${gtin}`,
        user,
      );
      return response;
    } catch (error) {
      this.logger.error('Error getting stock by GTIN:', error);
      throw error;
    }
  }

  async getStock(
    user: User,
    stockFilter: FSStockFilterRequestDto,
  ): Promise<FSStockResponseDto[]> {
    try {
      const response = await this.frontSystemsClient.post<FSStockResponseDto[]>(
        `/Stock`,
        user,
        stockFilter,
      );
      return response;
    } catch (error) {
      this.logger.error('Error getting stock:', error);
      throw error;
    }
  }

  async getStockByProductId(
    user: User,
    productId: string,
  ): Promise<FSStockResponseDto[]> {
    const stockFilter: FSStockFilterRequestDto = {
      productIds: [parseInt(productId)],
      includeStockQuantity: true,
      includeEmptyGTINs: true,
    };

    return await this.frontSystemsClient.post<FSStockResponseDto[]>(
      `/Stock`,
      user,
      stockFilter,
    );
  }

  async adjustStockQuantity(
    user: User,
    stockId: string,
    quantity: number,
  ): Promise<void> {
    try {
      await this.frontSystemsClient.post(`/Stock/${stockId}/Adjust`, user, {
        quantity,
      });
    } catch (error) {
      this.logger.error('Error adjusting stock:', error);
      throw error;
    }
  }

  async correctStockQuantity(
    user: User,
    productId: string,
    quantity: number,
  ): Promise<void> {
    try {
      await this.frontSystemsClient.put(`/CorrectStockQuantity`, user, {
        productId,
        quantity,
      });
    } catch (error) {
      this.logger.error('Error correcting stock quantity:', error);
      throw error;
    }
  }

  async getStockByGTIN(
    user: User,
    gtin: string,
  ): Promise<FSStockResponseDto[]> {
    try {
      return await this.frontSystemsClient.get<FSStockResponseDto[]>(
        `/GetStockQuantityByGTIN?gtin=${gtin}`,
        user,
      );
    } catch (error) {
      this.logger.error('Error getting stock by GTIN:', error);
      throw error;
    }
  }

  async getStockByIdentity(
    user: User,
    identity: string,
  ): Promise<FSStockResponseDto> {
    try {
      return await this.frontSystemsClient.get<FSStockResponseDto>(
        `/GetStockQuantityByIdentity?identity=${identity}`,
        user,
      );
    } catch (error) {
      this.logger.error('Error getting stock by identity:', error);
      throw error;
    }
  }

  async getStockSettings(user: User): Promise<any> {
    try {
      return await this.frontSystemsClient.get(`/GetStockSettings`, user);
    } catch (error) {
      this.logger.error('Error getting stock settings:', error);
      throw error;
    }
  }

  async reserveStock(
    user: User,
    stockId: string,
    quantity: number,
  ): Promise<void> {
    try {
      await this.frontSystemsClient.post(`/Stock/${stockId}/Reserve`, user, {
        quantity,
      });
    } catch (error) {
      this.logger.error('Error reserving stock:', error);
      throw error;
    }
  }

  async unreserveStock(
    user: User,
    stockId: string,
    quantity: number,
  ): Promise<void> {
    try {
      await this.frontSystemsClient.post(`/Stock/${stockId}/Unreserve`, user, {
        quantity,
      });
    } catch (error) {
      this.logger.error('Error unreserving stock:', error);
      throw error;
    }
  }

  async getStockHistory(
    user: User,
    stockId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    try {
      const response = await this.frontSystemsClient.get(
        `/Stock/${stockId}/History`,
        user,
        {
          params: {
            startDate,
            endDate,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error('Error getting stock history:', error);
      throw error;
    }
  }

  async getStockMovements(
    user: User,
    stockId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    try {
      const response = await this.frontSystemsClient.get(
        `/Stock/${stockId}/Movements`,
        user,
        {
          params: {
            startDate,
            endDate,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error('Error getting stock movements:', error);
      throw error;
    }
  }

  async getStockReservations(user: User, stockId: string): Promise<any> {
    try {
      const response = await this.frontSystemsClient.get(
        `/Stock/${stockId}/Reservations`,
        user,
      );
      return response;
    } catch (error) {
      this.logger.error('Error getting stock reservations:', error);
      throw error;
    }
  }

  async getStockTransfers(
    user: User,
    stockId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    try {
      const response = await this.frontSystemsClient.get(
        `/Stock/${stockId}/Transfers`,
        user,
        {
          params: {
            startDate,
            endDate,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error('Error getting stock transfers:', error);
      throw error;
    }
  }

  async getStockAdjustments(
    user: User,
    stockId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    try {
      const response = await this.frontSystemsClient.get(
        `/Stock/${stockId}/Adjustments`,
        user,
        {
          params: {
            startDate,
            endDate,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error('Error getting stock adjustments:', error);
      throw error;
    }
  }

  async getStockList(user: any): Promise<any> {
    return await this.frontSystemsClient.get<any>('/Stock/list', user);
  }
}
