import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateBuildingDto, UpdateBuildingDto } from './building.dto';
import { Building } from './building.entity';
import { BuildingService } from './building.service';

@Controller('buildings')
@ApiTags('buildings')
@UseInterceptors(ClassSerializerInterceptor)
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Get('')
  async findAll(): Promise<Building[]> {
    return this.buildingService.findAll();
  }

  @Post('')
  async create(@Body() data: CreateBuildingDto): Promise<Building[]> {
    return this.buildingService.createMany([data]);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateBuildingDto,
  ): Promise<boolean> {
    return this.buildingService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.buildingService.delete(id);
  }
}
