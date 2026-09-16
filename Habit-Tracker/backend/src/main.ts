import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Permite que NestJS pueda leer las cookies
  // enviadas por el navegador.
  app.use(cookieParser());

  // Permite peticiones desde nuestro frontend
  // incluyendo cookies.
  app.enableCors({
    origin:
      configService.get<string>('FRONTEND_URL') ??
      'http://localhost:3000',

    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port =
    configService.get<number>('PORT') ?? 3001;

  await app.listen(port);

  console.log(
    `Backend running on http://localhost:${port}`,
  );
}

bootstrap();