import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { FormatResponseInterceptor } from './common/interceptors/format-response.interceptor';
import { AccessLogModule } from './modules/access-log/access-log.module';
import { AccessLogService } from './modules/access-log/access-log.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { modules } from './modules';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const mainLevelLogger = new Logger('main.ts-level-logging');

  const accessLogService = app.select(AccessLogModule).get(AccessLogService);
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost, accessLogService),
  );
  app.useGlobalInterceptors(new FormatResponseInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get('PORT');

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Demo example')
    .setDescription('Demo building API description')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [...modules],
  });
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  mainLevelLogger.log(`Running at: ${port}`);
}
bootstrap();
