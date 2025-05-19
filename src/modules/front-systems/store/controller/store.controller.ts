import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { FsStoreService } from '../application/service/store.service';
import { FSStoreDto } from '../application/dto/stores.dto';

@Controller('front-system/store')
@UseGuards(JwtAuthGuard)
export class StoreController {
  private readonly logger = new Logger(StoreController.name);

  constructor(private readonly storeService: FsStoreService) {}

  @Get()
  async getStores(@CurrentUser() user: any): Promise<FSStoreDto[]> {
    this.logger.debug('USER EN STORE CONTROLLER:', user);
    if (!user) {
      throw new Error('No authenticated user found');
    }
    return this.storeService.getStores(user);
  }
}
