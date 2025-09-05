import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RowsController } from './rows.controller';
import { RowsService } from './rows.service';
import { Pipeline } from '../../domain/pipeline.entity';
import { ConnectionPoint } from '../../domain/point.entity';
import { Measurement } from '../../domain/measurement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pipeline, ConnectionPoint, Measurement])],
  controllers: [RowsController],
  providers: [RowsService],
})
export class RowsModule {}
