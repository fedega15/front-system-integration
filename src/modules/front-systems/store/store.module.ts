import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { FrontSystemsHttpClientService } from '@/common/application/service/front-systems-client.service';
import { FsStoreService } from './application/service/store.service';
import { Store, StoreSchema } from './infrastructure/schema/store.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreRepository } from './infrastructure/persistance/store-repository';
import { ConfigModule } from '@nestjs/config';
import { StoreController } from './controller/store.controller';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }]),
  ],
  providers: [FsStoreService, FrontSystemsHttpClientService, StoreRepository],
  controllers: [StoreController],
  exports: [StoreRepository, FsStoreService],
})
export class StoreModule {}
