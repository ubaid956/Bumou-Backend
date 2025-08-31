import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// import * as morganFunc from 'morgan';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    const configService = app.get(ConfigService);
    app.enableCors();

   
    console.log(`Listening on port ${process.env.PORT || 3000}`);

    const PORT = process.env.PORT || 3000;
    await app.listen(PORT, '0.0.0.0');
    console.log('Application started successfully.');
  } catch (error) {
    console.error('Error starting application:', error);
  }
}
bootstrap();
