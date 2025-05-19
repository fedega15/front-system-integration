import {
  Controller,
  Post,
  Body,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { SyncTasks } from '../service/sync.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { ProductFormatConfig } from '../dto/format-config.dto';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { mapImportResponse } from '../mappers/import-response.mapper';
import { ImportResponseDto } from '../dto/import-response.dto';
import { mapCurrentUser } from '../mappers/user.mapper';
import { WooCommerceCredentialsService } from '../service/woocommerce-credentials.service';
import { WooCommerceUrlResponseDto } from '../dto/woocommerce-url-response.dto';
import { CurrentUser as CurrentUserType } from '../interface/current-user.interface';
import { WooCommerceUrlDto } from '../dto/woocommerce-url.dto';
import { validateCurrentUser } from '../utils/user.utils';
import { handleControllerError } from '../utils/error.utils';

@Controller('sync')
export class SyncController {
  private readonly logger = new Logger(SyncController.name);

  constructor(
    private readonly syncTasks: SyncTasks,
    private readonly wooCommerceCredentialsService: WooCommerceCredentialsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('/import-products')
  async importProducts(
    @Body() { formatConfig }: { formatConfig: ProductFormatConfig },
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<ImportResponseDto> {
    try {
      validateCurrentUser(currentUser); //validacion de usuario

      const user = mapCurrentUser(currentUser);
      const result = await this.syncTasks.importProducts(
        formatConfig,
        currentUser.userId,
        user,
      );

      return mapImportResponse(result);
    } catch (error) {
      handleControllerError(error, 'SyncController.importProducts');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/set-woocommerce-url')
  async setWooCommerceUrl(
    @Body() { url }: WooCommerceUrlDto,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<WooCommerceUrlResponseDto> {
    try {
      validateCurrentUser(currentUser); //validacion de usuario

      return await this.wooCommerceCredentialsService.updateWooCommerceUrl(
        currentUser.userId, //userid
        url, //url de woocommerce
      );
    } catch (error) {
      handleControllerError(error, 'SyncController.setWooCommerceUrl');
    }
  }
}
