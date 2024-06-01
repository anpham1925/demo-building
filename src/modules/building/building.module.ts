import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { BuildingRepository } from './building.repository';
import { BuildingService } from './building.service';
import { BuildingController } from './building.controller';

@Module({
  imports: [DatabaseModule],
  providers: [BuildingRepository, BuildingService],
  exports: [BuildingService],
  controllers: [BuildingController],
})
export class BuildingModule {}
