import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL is not defined in environment variables at bootstrap');
  } else {
    logger.log('DATABASE_URL is defined at bootstrap');
  }

  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para permitir peticiones desde el frontend y dispositivos móviles
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Habilitar validación global para DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Servir archivos estáticos desde la carpeta uploads
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();
