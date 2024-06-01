import { Injectable, NestMiddleware } from '@nestjs/common';
import { AccessLogService } from '@src/modules/access-log/access-log.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly accessLogService: AccessLogService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const loggedId = await this.accessLogService.writeLog(req);
    (req as any).loggedId = loggedId;
    next();
  }
}
