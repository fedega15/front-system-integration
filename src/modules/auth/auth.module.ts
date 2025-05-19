import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { WebhooksModule } from '../webhook/webhook.module';

import { CommonModule } from '@/common/common.module';
import { AuthService } from './application/service/auth.service';
import { Company, CompanySchema } from './infrastructure/schemas/auth.schema';
import { AuthRepository } from './infrastructure/persistance/auth.repository';
import { AuthController } from './controller/auth.controller';
import { User, UserSchema } from './infrastructure/schemas/user.schema';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SensitiveDataService } from './application/service/sensitive-data.service';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    WebhooksModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy, JwtAuthGuard, SensitiveDataService],
  exports: [AuthService, JwtAuthGuard, SensitiveDataService, AuthRepository],
})
export class AuthModule {}

