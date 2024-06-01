import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Building } from './building.entity';
import { BuildingRepository } from './building.repository';
import { DataSource, EntityManager, In, IsNull, Like } from 'typeorm';
import configNamespace from '@src/config/configNamespace';
import { customThrowError } from '@src/common/utils/throw.util';
import { ERROR_MESSAGE } from '@src/common/constants/message.constant';

const SEPARATOR = '-';

@Injectable()
export class BuildingService implements OnModuleInit {
  constructor(
    @Inject(BuildingRepository)
    private readonly buildingRepository: BuildingRepository,

    @Inject(configNamespace.database.postgres)
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    console.log('Building module init');
  }

  /**
   * Test function that creates a tree of buildings.
   * Root nodes are created first and then their children are created.
   * Root nodes are named 'building A' and 'building B' while their children
   * are named 'Car Park' and 'Level 01'.
   * The function is used for testing and does not have any real use in production.
   */
  async seed() {
    // Create root nodes
    const root1 = this.buildingRepository.create({
      name: 'building A',
      code: 'A',
      building: 'A',
    });
    const root2 = this.buildingRepository.create({
      name: 'building B',
      code: 'B',
      building: 'A',
    });

    // Create root entities
    const [rootEntity1] = await this.createMany([root1, root2]);

    // Create first level entities
    const firstLevel1 = this.buildingRepository.create({
      name: 'Car Park',
      code: 'CarPark',
      parentId: rootEntity1.id, // Set the parent to rootEntity1
    });
    const firstLevel2 = this.buildingRepository.create({
      name: 'Level 01',
      code: '01',
      parentId: rootEntity1.id, // Set the parent to rootEntity1
    });

    // Create first level entities
    const [level1] = await this.createMany([firstLevel2, firstLevel1]);

    // create remaining level 1 entities
    const lobbyLevel1 = this.buildingRepository.create({
      name: 'Lobby Level 1',
      code: 'Lobby',
      parentId: level1.id, // Set the parent to rootEntity1
    });

    const corridorLevel1 = this.buildingRepository.create({
      name: 'Corridor Level 1',
      code: 'Corridor',
      parentId: level1.id, // Set the parent to rootEntity1
    });

    const masterRoomLevel1 = this.buildingRepository.create({
      name: 'Master Room',
      code: '01',
      parentId: level1.id, // Set the parent to rootEntity1
    });

    const [, , masterRoom] = await this.createMany([
      lobbyLevel1,
      corridorLevel1,
      masterRoomLevel1,
    ]);

    const meetingRoom1 = this.buildingRepository.create({
      name: 'Meeting Room',
      code: 'M1',
      parentId: masterRoom.id, // Set the parent to rootEntity1
    });
    await this.createMany([meetingRoom1]);
  }

  async findAll(): Promise<Building[]> {
    return this.buildingRepository.find({});
  }

  /**
   * Creates multiple buildings with the provided data.
   * The path and building fields of each building are updated based on their parent's path and building.
   *
   * @param buildings - An array of buildings to create.
   * @returns A promise that resolves to the created buildings.
   */
  async createMany(buildings: Partial<Building>[]): Promise<Building[]> {
    //check existing building with same code has same parent
    const existingListResult = await Promise.all(
      buildings.map((x) =>
        this.buildingRepository.exists({
          where: { code: x.code, parentId: x.parentId },
        }),
      ),
    );

    const firstErrorIndex = existingListResult.findIndex((x) => x);
    if (firstErrorIndex !== -1) {
      customThrowError(
        ERROR_MESSAGE.DUPLICATE_BUILDING_CODE,
        400,
        `${buildings[firstErrorIndex].name} - ${buildings[firstErrorIndex].code}`,
      );
    }

    // Get the unique parent IDs from the provided buildings
    const parentList = [...new Set(buildings.map((x) => x.parentId))];

    // Create a map to store the path and building of each parent building
    const pathMap: Map<number, Record<string, string>> = new Map();

    // If there are parent buildings, retrieve their paths and buildings
    if (parentList.length > 0) {
      const parentPath = await this.buildingRepository.find({
        where: { id: In(parentList) },
        select: ['path', 'id', 'building', 'code'],
      });

      // Store the path and building of each parent building in the map
      for (const { id, path, building } of parentPath) {
        pathMap.set(id, {
          path,
          building,
        });
      }
    }

    // Update the path and building fields of each building
    for (const building of buildings) {
      // If the building has a parent, retrieve its path and building from the map
      if (building.parentId) {
        if (!pathMap.has(building.parentId)) {
          // Throw an error if the parent building is not found
          customThrowError(
            `Parent not found for ${building.name} & ${building.code} & with parentId: ${building.parentId}`,
            404,
          );
        }
        const { building: parentBuilding, path } = pathMap.get(
          building.parentId,
        );
        // Update the path and building fields of the building
        building.path = path + SEPARATOR + building.code;
        building.building = parentBuilding;
      } else {
        // If the building does not have a parent, only update the path field
        building.path = building.code;
      }
    }

    // Save the buildings to the database and return the created buildings
    return this.buildingRepository.save(buildings);
  }

  /**
   * Updates a building with the provided data.
   * If the building is found, the path and building fields are updated.
   * The related path entities are also updated.
   *
   * @param id - The ID of the building to update.
   * @param data - The partial building data to update.
   * @returns A promise that resolves to true if the update is successful.
   * @throws {Error} If the building is not found.
   */
  async update(id: number, updateData: Partial<Building>): Promise<boolean> {
    console.log(typeof id, typeof updateData.parentId);
    if (id === updateData.parentId) {
      customThrowError(ERROR_MESSAGE.UPDATE_SELF_AS_PARENT, 400);
    }
    // Start a transaction to ensure data consistency
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      // Retrieve the building to update
      const [building, updateParentBuilding] = await Promise.all([
        transactionalEntityManager.findOne(Building, {
          where: { id },
          relations: ['parent'],
        }),
        transactionalEntityManager.findOne(Building, {
          where: { id: updateData.parentId ?? IsNull() },
        }),
      ]);

      // Throw an error if the building is not found
      if (!building) {
        customThrowError(ERROR_MESSAGE.BUILDING_NOT_FOUND, 404);
      }
      // Throw an error if the parent building is not found
      if (!updateParentBuilding && updateData.parentId) {
        customThrowError(ERROR_MESSAGE.PARENT_BUILDING_NOT_FOUND, 404);
      }

      if (
        updateParentBuilding &&
        updateParentBuilding.path.startsWith(building.path)
      ) {
        customThrowError(
          ERROR_MESSAGE.UPDATE_SELF_AS_DECENDANT_OF_DECENDANT,
          400,
        );
      }

      // Store the old path of the building
      const oldPath = building.path;
      // Calculate the new path based on the parent's path

      let newPath = '';

      if (!updateParentBuilding) {
        newPath = updateData.code;
      } else {
        newPath = updateParentBuilding.path + SEPARATOR + updateData.code;
      }

      // Update the building's path and building fields
      building.path = newPath;
      building.building = updateData.building;

      // Update the related path entities and the building
      await Promise.all([
        this._updateBuildingWithNewPath(
          oldPath,
          newPath,
          transactionalEntityManager,
        ),
        transactionalEntityManager.update(
          Building,
          { id },
          { ...updateData, path: newPath },
        ),
      ]);
    });

    // Return true to indicate that the update is successful
    return true;
  }

  /**
   * Deletes a building and its descendants from the database.
   * If a replacement building is provided, the building and its descendants are
   * deleted and replaced by the replacement building and its descendants.
   *
   * @param id - The ID of the building to delete.
   * @param replacedId - The ID of the building to replace the deleted building.
   * @returns A promise that resolves when the operation is complete.
   */
  async delete(id: number): Promise<void> {
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      // Execute queries using transactionalEntityManager

      // Find the building and the building to replace it
      const deletingBuilding = await transactionalEntityManager.findOne(
        Building,
        { where: { id } },
      );

      // If the building or the replacement building is not found, return
      if (!deletingBuilding) return;

      // Otherwise, delete the building and all its descendants
      return this._deleteAndRemoveDescendants(
        deletingBuilding,
        transactionalEntityManager,
      );
    });
  }

  /**
   * Deletes a building and all its descendants from the database.
   *
   * @param building - The building to be deleted.
   * @param transactionalEntityManager - The transactional entity manager to use for database operations.
   * @returns A promise that resolves when the operation is complete.
   */
  private async _deleteAndRemoveDescendants(
    building: Building,
    transactionalEntityManager: EntityManager,
  ): Promise<void> {
    await Promise.all([
      transactionalEntityManager.delete(Building, {
        path: Like(building.path + '%'),
      }),
      transactionalEntityManager.delete(Building, { id: building.id }),
    ]);
  }

  /**
   * Updates the paths of buildings whose paths contain the old path.
   *
   * @param oldPath - The old path to be replaced.
   * @param newPath - The new path to replace the old path.
   * @param transactionalEntityManager - The transactional entity manager to use for database operations.
   * @returns A promise that resolves when the operation is complete.
   */
  private async _updateBuildingWithNewPath(
    oldPath: string,
    newPath: string,
    transactionalEntityManager: EntityManager,
  ) {
    // Create a query builder to update the Building entity
    const queryBuilder = transactionalEntityManager
      .createQueryBuilder()
      .update(Building)
      // Update the path column with a REPLACE function
      .set({ path: () => `REPLACE(path, :oldPath, :newPath)` })
      // Set the parameters for the REPLACE function
      .setParameters({ oldPath, newPath })
      // Filter the rows to be updated
      .where({ path: Like(oldPath + '%') });

    // Execute the update query and return the promise
    return queryBuilder.execute();
  }
}
