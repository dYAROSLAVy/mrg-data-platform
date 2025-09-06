import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { Pipeline } from '../../domain/pipeline.entity';
import { ConnectionPoint } from '../../domain/point.entity';
import { Measurement } from '../../domain/measurement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pipeline, ConnectionPoint, Measurement])],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
