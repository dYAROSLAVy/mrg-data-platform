import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeriesController } from './series.controller';
import { SeriesService } from './series.service';
import { Pipeline } from '../../domain/pipeline.entity';
import { ConnectionPoint } from '../../domain/point.entity';
import { Measurement } from '../../domain/measurement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pipeline, ConnectionPoint, Measurement])],
  controllers: [SeriesController],
  providers: [SeriesService],
})
export class SeriesModule {}
