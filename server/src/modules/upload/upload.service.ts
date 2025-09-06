import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Pipeline } from '../../domain/pipeline.entity';
import { Measurement } from '../../domain/measurement.entity';
import { ConnectionPoint } from '../../domain/point.entity';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Pipeline) private readonly pipeRepo: Repository<Pipeline>,
    @InjectRepository(ConnectionPoint) private readonly pointRepo: Repository<ConnectionPoint>,
    @InjectRepository(Measurement) private readonly measRepo: Repository<Measurement>,
  ) {}

  private toNum(v: any): number | null {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    if (s === '' || s === '-') return null;
    const n = Number(s.replace(/\s+/g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }

  private toMonthStart(v: any): Date {
    if (v instanceof Date) return new Date(v.getFullYear(), v.getMonth(), 1);
    const s = String(v).trim();
    const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s);
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, 1);
    const d = new Date(s);
    if (!isNaN(+d)) return new Date(d.getFullYear(), d.getMonth(), 1);
    throw new BadRequestException(`Bad date: ${v}`);
  }

  async ingestXlsx(buf: Buffer) {
    const wb = XLSX.read(buf, { type: 'buffer', cellDates: true, codepage: 65001 });
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (!ws) throw new BadRequestException('Empty workbook');

    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });
    const data = rows.slice(2);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const r of data) {
      if (!r || r.length < 7) {
        skipped++;
        continue;
      }

      const pipeName = String(r[0] ?? '').trim();
      const pointName = String(r[1] ?? '').trim();
      const kmRaw = r[2];
      const periodRaw = r[3];
      const loadRaw = r[4];
      const flowRaw = r[5];
      const tvpsRaw = r[6];

      if (!pipeName || !pointName || !periodRaw) {
        skipped++;
        continue;
      }

      const km = this.toNum(kmRaw);
      const period = this.toMonthStart(periodRaw);
      const load_level = this.toNum(loadRaw);
      const flow_mmscmd = this.toNum(flowRaw);
      const tvps_mmscmd = this.toNum(tvpsRaw);

      let pipeline = await this.pipeRepo.findOne({ where: { name: pipeName } });
      if (!pipeline) {
        pipeline = await this.pipeRepo.save(this.pipeRepo.create({ name: pipeName }));
      }

      let point = await this.pointRepo.findOne({
        where: { name: pointName, pipeline: { id: pipeline.id } },
        relations: ['pipeline'],
      });
      if (!point) {
        point = await this.pointRepo.save(
          this.pointRepo.create({ pipeline, name: pointName, km: km ?? null }),
        );
      } else if (km !== null && point.km !== km) {
        point.km = km;
        await this.pointRepo.save(point);
      }

      const where = { pipeline: { id: pipeline.id }, point: { id: point.id }, period };
      const existing = await this.measRepo.findOne({ where });

      if (!existing) {
        const entity = this.measRepo.create({
          pipeline,
          point,
          period,
          load_level,
          flow_mmscmd,
          tvps_mmscmd,
        });
        await this.measRepo.save(entity);
        inserted++;
      } else {
        const patch: Partial<Measurement> = {};
        if (load_level !== null && load_level !== existing.load_level)
          patch.load_level = load_level;
        if (flow_mmscmd !== null && flow_mmscmd !== existing.flow_mmscmd)
          patch.flow_mmscmd = flow_mmscmd;
        if (tvps_mmscmd !== null && tvps_mmscmd !== existing.tvps_mmscmd)
          patch.tvps_mmscmd = tvps_mmscmd;

        if (Object.keys(patch).length) {
          await this.measRepo.update(where as any, patch);
          updated++;
        } else {
          skipped++;
        }
      }
    }

    return { inserted, updated, skipped };
  }
}
