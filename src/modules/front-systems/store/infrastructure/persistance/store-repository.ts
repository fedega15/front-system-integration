import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { FSStoreDto } from '../../application/dto';
import { Store } from '../schema/store.schema';

@Injectable()
export class StoreRepository {
  private readonly logger = new Logger(StoreRepository.name);

  constructor(@InjectModel(Store.name) private StoreModel: Model<Store>) {}

  async create(storeDto: FSStoreDto): Promise<Store> {
    const createdStore = new this.StoreModel(storeDto);
    return createdStore.save();
  }

  async findOne(id: number): Promise<Store> {
    return this.StoreModel.findOne({ id }).lean().exec();
  }

  async findAll(): Promise<Store[]> {
    return this.StoreModel.find().lean().exec();
  }

  async upsertStores(stores: FSStoreDto[]): Promise<void> {
    try {
      for (const store of stores) {
        await this.StoreModel.findOneAndUpdate(
          { StoreId: store.StoreId }, // Filtro para encontrar el store por su id
          store, // Datos a actualizar o insertar
          { upsert: true, new: true }, // Opciones: upsert y devolver el documento actualizado
        ).exec();
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error upserting stores: ${error.message}`);
      }
      throw new Error('Error upserting stores: ' + JSON.stringify(error));
    }
  }

  async findOneByStockId(stockId: number): Promise<Store | null> {
    try {
      return this.StoreModel.findOne({ StockId: stockId }).lean().exec();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Error finding store by stockId ${stockId}: ${error.message}`,
        );
      }
      throw new Error(
        `Error finding store by stockId ${stockId}: ` + JSON.stringify(error),
      );
    }
  }
}
