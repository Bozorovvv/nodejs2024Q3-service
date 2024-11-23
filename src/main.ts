import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { LoggingService } from './logging/logging.service';
import { HttpExceptionFilter } from './logging/http-exception.filter';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const loggingService = app.get(LoggingService);
  app.useGlobalFilters(new HttpExceptionFilter(loggingService));

  process.on('uncaughtException', (error: Error) => {
    loggingService.error('Uncaught Exception', {
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    loggingService.error('Unhandled Rejection', {
      reason,
      promise,
    });
  });
  await app.listen(PORT, '0.0.0.0');
}
bootstrap();
