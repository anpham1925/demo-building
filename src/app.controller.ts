import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Building } from './modules/building/building.entity';

// keeping for testing purpose only, do not use it in production
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('init')
  init(): Promise<string> {
    return this.appService.init();
  }

  @Get()
  getHello(): Promise<Building[]> {
    return this.appService.getHello();
  }

  @Get('update')
  update(): Promise<boolean> {
    return this.appService.update();
  }
}
