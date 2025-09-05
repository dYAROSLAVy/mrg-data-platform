import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SeriesQueryDto } from './dto/series.query.dto';
import { Pipeline } from '../../domain/pipeline.entity';
import { ConnectionPoint } from '../../domain/point.entity';
import { Measurement } from '../../domain/measurement.entity';

function monthToDate(s: string) {
  return `${s}-01`;
}

@Injectable()
export class SeriesService {
  constructor(private readonly ds: DataSource) {}

  async getSeries(q: SeriesQueryDto) {
    const { pipelineId, pointId, from, to } = q;

    const pipeline = await this.ds.getRepository(Pipeline).findOne({ where: { id: pipelineId } });
    if (!pipeline) throw new NotFoundException('pipeline not found');

    let point: ConnectionPoint | null = null;
    if (pointId) {
      point = await this.ds.getRepository(ConnectionPoint).findOne({ where: { id: pointId } });
      if (!point) throw new NotFoundException('point not found');
    }

    const qb = this.ds
      .getRepository(Measurement)
      .createQueryBuilder('m')
      .where('m.pipelineId = :pipelineId', { pipelineId })
      .orderBy('m.period', 'ASC');

    if (pointId) qb.andWhere('m.pointId = :pointId', { pointId });

    if (from) qb.andWhere('m.period >= :from', { from: monthToDate(from) });
    if (to) qb.andWhere('m.period <= :to', { to: monthToDate(to) });

    qb.select([
      `TO_CHAR(m.period, 'YYYY-MM') AS period`,
      'm.flow_mmscmd AS flow',
      'm.tvps_mmscmd AS tvps',
    ]);

    const rows = await qb.getRawMany<{
      period: string;
      flow: string | null;
      tvps: string | null;
    }>();
    const series = rows.map((r) => ({
      period: r.period,
      flow: r.flow !== null ? Number(r.flow) : null,
      tvps: r.tvps !== null ? Number(r.tvps) : null,
    }));

    return {
      pipeline: { id: pipeline.id, name: pipeline.name },
      point: point
        ? { id: point.id, name: point.name, km: point.km !== null ? Number(point.km) : null }
        : null,
      series,
    };
  }
}
