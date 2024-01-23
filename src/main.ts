import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import 'dotenv/config';
import { HttpExceptionFilter } from './global-utils/global-services/pipes/ErrorExceptionFilterPipe';
import * as cors from 'cors';
import * as hpp from 'hpp';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);
  app.use(cors());
  app.use(helmet());
  app.use(hpp());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT || 5000);
}
bootstrap();
