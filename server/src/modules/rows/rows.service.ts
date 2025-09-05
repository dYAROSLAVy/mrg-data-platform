import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Pipeline } from '../../domain/pipeline.entity';
import { ConnectionPoint } from '../../domain/point.entity';
import { Measurement } from '../../domain/measurement.entity';
import { RowsQueryDto } from './dto/rows.query.dto';

@Injectable()
export class RowsService {
  constructor(private readonly ds: DataSource) {}

  async getRows(q: RowsQueryDto) {
    const { limit = 100, offset = 0, year, pipelineId, pointId, search, sort = 'period:asc' } = q;

    const qb = this.ds
      .getRepository(Measurement)
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.pipeline', 'p')
      .leftJoinAndSelect('m.point', 'cp');

    if (year) qb.andWhere('EXTRACT(YEAR FROM m.period) = :year', { year: Number(year) });
    if (pipelineId) qb.andWhere('p.id = :pipelineId', { pipelineId });
    if (pointId) qb.andWhere('cp.id = :pointId', { pointId });
    if (search) {
      qb.andWhere('(LOWER(p.name) LIKE :s OR LOWER(cp.name) LIKE :s)', {
        s: `%${search.toLowerCase()}%`,
      });
    }

    const total = await qb.clone().getCount();

    const [field, dir] = sort.split(':') as [string, 'asc' | 'desc'];
    const map: Record<string, string> = {
      period: 'm.period',
      pipelineName: 'p.name',
      pointName: 'cp.name',
      load: 'm.load_level',
      flow: 'm.flow_mmscmd',
      tvps: 'm.tvps_mmscmd',
    };
    qb.orderBy(map[field] ?? 'm.period', dir.toUpperCase() as 'ASC' | 'DESC')
      .addOrderBy('p.name', 'ASC')
      .offset(offset)
      .limit(limit);
    qb.select([
      'm.id AS id',
      'p.id AS "pipelineId"',
      'p.name AS "pipelineName"',
      'cp.id AS "pointId"',
      'cp.name AS "pointName"',
      'cp.km AS km',
      `TO_CHAR(m.period, 'YYYY-MM') AS period`,
      'm.load_level AS load',
      'm.flow_mmscmd AS flow',
      'm.tvps_mmscmd AS tvps',
    ]);

    const rows = await qb.getRawMany<{
      id: string;
      pipelineId: string;
      pipelineName: string;
      pointId: string | null;
      pointName: string | null;
      km: string | null;
      period: string;
      load: string | null;
      flow: string | null;
      tvps: string | null;
    }>();

    const data = rows.map((r) => ({
      id: r.id,
      pipelineId: r.pipelineId,
      pipelineName: r.pipelineName,
      pointId: r.pointId ?? null,
      pointName: r.pointName ?? null,
      km: r.km !== null ? Number(r.km) : null,
      period: r.period,
      load: r.load !== null ? Number(r.load) : null,
      flow: r.flow !== null ? Number(r.flow) : null,
      tvps: r.tvps !== null ? Number(r.tvps) : null,
    }));

    return { data, meta: { total, limit, offset } };
  }
}
