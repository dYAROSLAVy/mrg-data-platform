import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ConnectionPoint } from './point.entity';
import { Measurement } from './measurement.entity';

@Entity('pipeline')
@Unique(['name'])
export class Pipeline {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 256 })
  name!: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  region: string | null = null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @OneToMany(() => ConnectionPoint, (p) => p.pipeline)
  points!: ConnectionPoint[];

  @OneToMany(() => Measurement, (m) => m.pipeline)
  measurements!: Measurement[];
}
