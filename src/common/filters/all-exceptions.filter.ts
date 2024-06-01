import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AccessLogService } from '@src/modules/access-log/access-log.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly accessLogService: AccessLogService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const detailError =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'INTERNAL_SERVER_ERROR';

    const { loggedId } = request;

    console.log(exception);
    console.log((exception as Error).stack);

    await this.accessLogService.updateLogError(loggedId, exception);

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      loggedId,
      detailError,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
