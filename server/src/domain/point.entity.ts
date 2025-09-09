import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Pipeline } from './pipeline.entity';
import { Measurement } from './measurement.entity';

@Entity('connection_point')
@Unique(['pipeline', 'name'])
export class ConnectionPoint {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Pipeline, (p) => p.points, { onDelete: 'CASCADE' })
  @Index()
  pipeline!: Pipeline;

  @Column({ type: 'varchar', length: 256 })
  name!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  km: number | null = null;

  @OneToMany(() => Measurement, (m) => m.point)
  measurements!: Measurement[];
}
