import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Building {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ unique: true })
  path: string;

  @Column({ nullable: true })
  parentId: number;

  @ManyToOne(() => Building, (building) => building.parent)
  @JoinColumn()
  parent?: Building;

  @Column()
  building: string;
}
