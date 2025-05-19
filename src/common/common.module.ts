import { Module } from '@nestjs/common';
import { MapperService } from './application/mapper/mapper.service';
import { FrontSystemsHttpClientService } from './application/service/front-systems-client.service';

@Module({
  imports: [],
  providers: [MapperService, FrontSystemsHttpClientService],
  exports: [MapperService, FrontSystemsHttpClientService],
})
export class CommonModule {}
