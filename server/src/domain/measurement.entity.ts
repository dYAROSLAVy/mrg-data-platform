import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Pipeline } from '../domain/pipeline.entity';
import { ConnectionPoint } from './point.entity';

@Entity('measurement')
@Unique(['pipeline', 'point', 'period'])
@Index(['pipeline', 'period'])
@Index(['point', 'period'])
export class Measurement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Pipeline, (p) => p.measurements, { onDelete: 'CASCADE' })
  pipeline!: Pipeline;

  @ManyToOne(() => ConnectionPoint, (cp) => cp.measurements, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  point: ConnectionPoint | null = null;

  @Column({ type: 'date' })
  period!: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  load_level: string | null = null;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  flow_mmscmd: string | null = null;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  tvps_mmscmd: string | null = null;
}
