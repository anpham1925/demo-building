import { Inject, Injectable } from '@nestjs/common';
import configNamespace from '@src/config/configNamespace';
import { DataSource, TreeRepository } from 'typeorm';
import { Building } from './building.entity';

@Injectable()
export class BuildingRepository extends TreeRepository<Building> {
  private _alias = 'building';

  constructor(
    @Inject(configNamespace.database.postgres)
    private dataSource: DataSource,
  ) {
    super(Building, dataSource.createEntityManager());
  }
}
