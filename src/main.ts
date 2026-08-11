import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

const allowedOrigins = [
  'https://patitascaminando.netlify.app',
  'https://backoffice-patitas.netlify.app',
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 3000;

  app.enableCors({
    origin: allowedOrigins,
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    if (
      req.path.startsWith('/public/') &&
      origin &&
      !allowedOrigins.includes(origin)
    ) {
      return res.status(403).json({
        message: 'Origin not allowed',
      });
    }

    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(port);
}

void bootstrap();