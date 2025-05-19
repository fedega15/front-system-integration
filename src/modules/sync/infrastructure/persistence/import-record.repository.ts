import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ImportRecord } from '../schema/import-record.schema';

@Injectable()
export class ImportRecordRepository {
  private readonly logger = new Logger(ImportRecordRepository.name);

  constructor(
    @InjectModel(ImportRecord.name)
    private readonly importRecordModel: Model<ImportRecord>,
  ) {}

  async create(data: Partial<ImportRecord>): Promise<ImportRecord> {
    const createdRecord = new this.importRecordModel(data);
    return createdRecord.save();
  }

  async findAll(): Promise<ImportRecord[]> {
    return this.importRecordModel.find().exec();
  }

  async findByUserId(userId: string): Promise<ImportRecord[]> {
    return this.importRecordModel.find({ userId }).exec();
  }

  async findByCompanyId(companyId: string): Promise<ImportRecord[]> {
    return this.importRecordModel.find({ companyId }).exec();
  }

  async findOne(id: string): Promise<ImportRecord> {
    return this.importRecordModel.findById(id).exec();
  }

  async update(id: string, updateData: Partial<ImportRecord>): Promise<ImportRecord> {
    return this.importRecordModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<ImportRecord> {
    return this.importRecordModel.findByIdAndDelete(id).exec();
  }

  async findByUserIdAndCompanyId(userId: string, companyId: string): Promise<ImportRecord[]> {
    this.logger.debug('Querying import records with:', { userId, companyId });
    
    const records = await this.importRecordModel
      .find({ userId, companyId })
      .sort({ startTime: -1 })
      .exec();

    this.logger.debug('MongoDB query result:', {
      count: records.length,
      records: records.map(r => ({
        id: r._id,
        userId: r.userId,
        companyId: r.companyId,
        totalProducts: r.totalProducts,
        importedProducts: r.importedProducts,
        status: r.status
      }))
    });

    return records;
  }

  async findById(id: string): Promise<ImportRecord> {
    return this.importRecordModel.findById(id).exec();
  }
} 