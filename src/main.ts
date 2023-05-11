import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config();
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
  console.log('server is running on port 3000 ...');
}
bootstrap();
