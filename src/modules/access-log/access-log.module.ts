import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AccessLogRepository } from './access-log.repository';
import { AccessLogService } from './access-log.service';

@Module({
  imports: [DatabaseModule],
  providers: [AccessLogRepository, AccessLogService],
  exports: [AccessLogService],
})
export class AccessLogModule {}
