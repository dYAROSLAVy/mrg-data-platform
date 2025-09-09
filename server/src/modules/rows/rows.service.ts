import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Measurement } from '../../domain/measurement.entity';
import { RowsQueryDto } from './dto/rows.query.dto';

@Injectable()
export class RowsService {
  constructor(private readonly ds: DataSource) {}

  async getRows(q: RowsQueryDto) {
    const {
      limit = 100,
      offset = 0,
      year,
      pipelineId,
      pointId,
      search,
      loadBand,
      sort = 'pipelineName:asc',
    } = q;

    const qb = this.ds
      .getRepository(Measurement)
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.pipeline', 'p')
      .leftJoinAndSelect('m.point', 'cp');

    if (year) qb.andWhere('LEFT(m.period::text, 4) = :year', { year: String(year) });
    if (pipelineId) qb.andWhere('p.id = :pipelineId', { pipelineId });
    if (pointId) qb.andWhere('cp.id = :pointId', { pointId });
    if (search) {
      qb.andWhere('(LOWER(p.name) LIKE :s OR LOWER(cp.name) LIKE :s)', {
        s: `%${search.toLowerCase()}%`,
      });
    }
    if (loadBand === 'ok') {
      qb.andWhere('m.load_level < :warn', { warn: 40 });
    } else if (loadBand === 'warn') {
      qb.andWhere('m.load_level >= :warn AND m.load_level < :critical', { warn: 40, critical: 80 });
    } else if (loadBand === 'critical') {
      qb.andWhere('m.load_level >= :critical', { critical: 80 });
    }

    const total = await qb.clone().getCount();

    const [, dirRaw] = (sort ?? 'pipelineName:asc').split(':') as [string, 'asc' | 'desc'];
    const direction = (dirRaw?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC') as 'ASC' | 'DESC';

    qb.orderBy('p.name', direction)
      .addOrderBy('m.period', 'ASC')
      .addOrderBy('cp.name', 'ASC')
      .addOrderBy('cp.km', 'ASC')
      .addOrderBy('m.id', 'ASC')
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
  async getYears(): Promise<number[]> {
    const raw = await this.ds
      .getRepository(Measurement)
      .createQueryBuilder('m')
      .select('DISTINCT CAST(LEFT(m.period::text, 4) AS INTEGER)', 'year')
      .orderBy('year', 'DESC')
      .getRawMany<{ year: string | number }>();

    return raw.map((r) => Number(r.year)).filter((n) => Number.isFinite(n));
  }
}
