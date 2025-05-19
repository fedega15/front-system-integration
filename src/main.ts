import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const cookieParser = require('cookie-parser');

const corsOptions: CorsOptions = {
  origin: [
    'https://g9-integration-fe.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://d06d-2800-2123-20c0-11b3-bd6b-955b-9047-f8f1.ngrok-free.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-wc-webhook-topic',
    'x-wc-webhook-source',
    'x-wc-webhook-signature',
  ],
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors(corsOptions);
  // app.enableCors();

  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe());

  app.use(cookieParser());

  await app.listen(configService.get('server.port'));
}

bootstrap();
