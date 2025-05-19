import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuthRepository {
  private users: User[] = [];
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {
    this.sync();
  }

  async create(createAuthorization: any): Promise<User> {
    const createdAuthorization = new this.UserModel(createAuthorization);
    return createdAuthorization.save();
  }

  async findAll(): Promise<User[]> {
    return this.UserModel.find().lean<User[]>();
  }

  async findOne(username): Promise<User> {
    return this.UserModel.findOne({ username }).lean<User>();
  }

  async findOneAndUpdate(filter: any, updateData: any): Promise<User> {
    return this.UserModel.findOneAndUpdate(filter, updateData, {
      new: true, // Retorna el documento actualizado
      upsert: true, // Crea el documento si no existe
      useFindAndModify: false, // Evita advertencias de Mongoose
    });
  }

  async findByIdAndUpdate(id: string, updateData: any): Promise<User> {
    return this.UserModel.findByIdAndUpdate(id, updateData, {
      new: true, // Retorna el documento actualizado
      useFindAndModify: false, // Evita advertencias de Mongoose
    });
  }

  async findByStoreUrl(url: string): Promise<User> {
    return this.UserModel.findOne({ WooCommerceUrl: url });
  }

  // para el login en el jwt
  async findById(id: string): Promise<User | null> {
    return this.UserModel.findById(id).exec();
  }

  async update(
    username: string,
    userData: Partial<User>,
  ): Promise<User | null> {
    return this.UserModel.findOneAndUpdate({ username }, userData, {
      new: true,
    }).exec();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async sync() {
    this.users = await this.findAll();
  }

  public getUserByStoreUrl(url: string): User {
    return this.users.find((user) => user.WooCommerceUrl === url);
  }

  async countCompanyUsers(): Promise<number> {
    return this.UserModel.countDocuments({ role: 'company' }).exec();
  }

  async countActiveCompanyUsers(): Promise<number> {
    // Assuming 'active' means having Front Systems API keys
    return this.UserModel.countDocuments({
      role: 'company',
      FsSubscriptionKey: { $exists: true, $ne: null },
      FsApiKey: { $exists: true, $ne: null },
    }).exec();
  }
}
