import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';

import { Pipeline } from './domain/pipeline.entity';
import { ConnectionPoint } from './domain/point.entity';
import { Measurement } from './domain/measurement.entity';

import { RowsModule } from './modules/rows/rows.module';
import { SeriesModule } from './modules/series/series.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Pipeline, ConnectionPoint, Measurement],
      synchronize: false,
    }),
    RowsModule,
    SeriesModule,
    UploadModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
