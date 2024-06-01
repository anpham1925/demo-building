import { CommonEntity } from '@src/database/common/entity/entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class AccessLog extends CommonEntity {
  @Column()
  ip: string;

  @Column({
    nullable: true,
  })
  userId?: string;

  @Column({ nullable: true })
  detail?: string;

  @Column({
    nullable: true,
  })
  url?: string;

  @Column({ nullable: true })
  general?: string;
}
