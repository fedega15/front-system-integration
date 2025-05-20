import { Injectable, HttpException, HttpStatus, Logger, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { AuthRepository } from '../../infrastructure/persistance/auth.repository';
import { AuthDto } from '../dto/auth.dto';
import axios from 'axios';
import { FSStoreDto } from '@/modules/front-systems/store/application/dto';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '../../infrastructure/schemas/user.schema';
import { Request, Response } from 'express';
import { SensitiveDataService } from './sensitive-data.service';
import { WebhookService } from '@/modules/webhook/application/service/webhook.service';

// Crea un archivo types/jwt.d.ts o en tu archivo de tipos existente
interface UserJwtPayload {
  id: string;
  username: string;
  role: string;
  Orgnum?: string;
  LegalName?: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sensitiveDataService: SensitiveDataService,
    private readonly webhookService: WebhookService,
  ) {}

  async registerAdmin(username: string, password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await this.authRepository.create({
      username,
      password: hashedPassword,
      role: 'admin',
    });
    return jwt.sign(
      { id: admin._id, username, role: 'admin' },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      },
    );
  }

  async registerCompany(
    adminUserName: string,
    companyData: AuthDto,
  ): Promise<User> {
    try {
      const admin = await this.authRepository.findOne(adminUserName);
      if (!admin)
        throw new HttpException('No autorizado', HttpStatus.FORBIDDEN);
    } catch (error) {
      console.error('Hubo un error al buscar el usuario');
    }

    let stores: FSStoreDto[];
    try {
      const { FsSubscriptionKey, FsApiKey } = companyData;
      const response = await axios.get<FSStoreDto[]>(
        'https://frontsystemsapis.frontsystems.no/restapi/V2/api/Stores',
        {
          headers: {
            'Ocp-Apim-Subscription-Key': FsSubscriptionKey,
            'x-api-key': FsApiKey,
          },
        },
      );
      stores = response.data;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error en la petición a getStores: ${error.message}`);
      } else {
        this.logger.error('Error en la petición a getStores:', error);
      }
      throw new HttpException(
        'Las API keys son inválidas o no hay tiendas asociadas.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!stores.length) {
      throw new HttpException(
        'No se encontraron tiendas para estas API Keys.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { LegalName, Orgnum } = stores[0];
    const {
      username,
      password,
      FsSubscriptionKey,
      FsApiKey,
      WooCommerceConsumerKey,
      WooCommerceConsumerSecret,
      WooCommerceUrl,
    } = companyData;
    const hashedPassword = await bcrypt.hash(password, 10);

    let company: User;
    try {
      company = await this.authRepository.create({
        username,
        password: hashedPassword,
        role: 'company',
        LegalName,
        Orgnum,
        FsSubscriptionKey,
        FsApiKey,
        WooCommerceConsumerKey,
        WooCommerceConsumerSecret,
        WooCommerceUrl,
      });
    } catch (error) {
      const err: any = error;
      if (err?.code === 11000) {
        const duplicatedField = Object.keys(err.keyPattern || {})[0] || 'unknown';
        throw new ConflictException(`Duplicate value for field: ${duplicatedField}`);
      }
      throw new InternalServerErrorException('Unexpected error during company registration');
    }

    try {
      await this.webhookService.setupWooCommerceWebhooks(company);
      await this.webhookService.setupFrontSystemsWebhook(company);
      this.logger.log(
        `Webhooks configured successfully for user ${company.id}`,
      );
    } catch (webhookError) {
      this.logger.error(
        `Failed to setup webhooks for user ${company.id}:`,
        webhookError,
      );
    }

    return company;
  }

  async login(username: string, password: string): Promise<string> {
    this.logger.debug(`Attempting login for user: ${username}`);
    const user = await this.authRepository.findOne(username);

    if (!user) {
      this.logger.debug(`Login failed for user ${username}: User not found.`);
    } else {
      this.logger.debug(`User found: ${user.username}, role: ${user.role}`);
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      this.logger.debug(`Password comparison result for user ${username}: ${isPasswordMatch}`);

      if (!isPasswordMatch) {
         this.logger.debug(`Login failed for user ${username}: Incorrect password.`);
      }

      if (!user || !isPasswordMatch) {
        throw new HttpException(
          'Credenciales incorrectas',
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    this.logger.debug('User found:', {
      id: user._id,
      username: user.username,
      role: user.role,
      Orgnum: user.Orgnum,
      LegalName: user.LegalName,
    });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        Orgnum: user.Orgnum,
        LegalName: user.LegalName,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' },
    );

    return token;
  }

  async getProfile(req: Request, res: Response) {
    try {
      const token = req.cookies?.token;

      if (!token) {
        return res.status(200).json({ user: null });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
      ) as UserJwtPayload;

      // Get sensitive data from the service
      const sensitiveData = await this.sensitiveDataService.getSensitiveData(
        decoded.id,
      );

      return res.status(200).json({
        user: {
          id: decoded.id,
          username: decoded.username,
          role: decoded.role,
          Orgnum: decoded.Orgnum,
          LegalName: decoded.LegalName,
          apiKeys: sensitiveData,
        },
      });
    } catch (error) {
      return res.status(200).json({ user: null });
    }
  }

  async verifyApiKey(Orgnum: string, apiKey: string): Promise<boolean> {
    const company = await this.authRepository.findOne(Orgnum);
    if (!company) {
      throw new HttpException('Empresa no encontrada', HttpStatus.NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(apiKey, company.FsApiKey);
    if (!isMatch) {
      throw new HttpException('API Key incorrecta', HttpStatus.UNAUTHORIZED);
    }

    return true;
  }
}
