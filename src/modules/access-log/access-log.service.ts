import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AccessLog } from './access-log.entity';
import { AccessLogRepository } from './access-log.repository';

@Injectable()
export class AccessLogService implements OnModuleInit {
  constructor(
    @Inject(AccessLogRepository)
    private accessLogRepository: AccessLogRepository,
  ) {}

  onModuleInit() {
    console.log('Access-log module init');
  }

  async writeLog(request: Record<string, any>): Promise<number> {
    const log = new AccessLog();
    log.userId = request.user?.id;
    log.ip = request.header('x-forwarded-for') || request.socket.remoteAddress;
    log.url = request.originalUrl;
    const result = await this.accessLogRepository.save(log);
    return result.id;
  }

  async updateLogError(id: number, error): Promise<void> {
    if (!id) return;
    await this.accessLogRepository.update(id, {
      general: error,
      detail: error?.stack,
    });
  }
}
