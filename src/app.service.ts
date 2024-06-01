import { Injectable } from '@nestjs/common';
import { BuildingService } from './modules/building/building.service';
import { Building } from './modules/building/building.entity';

@Injectable()
export class AppService {
  constructor(private readonly buildingService: BuildingService) {}
  async init(): Promise<string> {
    await this.buildingService.seed();
    return 'Hello World!';
  }

  async getHello(): Promise<Building[]> {
    return this.buildingService.findAll();
  }

  async update(): Promise<boolean> {
    return this.buildingService.update(3, {
      id: 3,
      name: 'updated Level 01',
      code: 'D',
    });
  }
}
