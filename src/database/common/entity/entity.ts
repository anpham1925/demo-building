import { dayjs } from '@src/common/helpers/dayjs.helper';
import { CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    type: 'timestamptz',
    update: false,
    default: dayjs.utc(),
  })
  createdAt: Date;
}
