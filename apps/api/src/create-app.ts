import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

const SWAGGER_PATH = 'api/docs';

function setupSwagger(app: INestApplication): void {
  const documentConfig = new DocumentBuilder()
    .setTitle('KioskFlow API')
    .setDescription('API do totem de autoatendimento, do pagamento e da cozinha em tempo real.')
    .setVersion('0.1.0')
    .build();
  SwaggerModule.setup(SWAGGER_PATH, app, SwaggerModule.createDocument(app, documentConfig));
}

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, { rawBody: true, abortOnError: false });
  setupSwagger(app);
  return app;
}
