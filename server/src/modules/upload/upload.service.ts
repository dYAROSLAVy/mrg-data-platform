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

  private normalizeHeader(v: any): string {
    return String(v ?? '')
      .replace(/\u00A0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeStrong(v: any): string {
    return this.normalizeHeader(v)
      .toLowerCase()
      .replace(/[().,:%]/g, ' ')
      .replace(/³/g, '3')
      .replace(/ё/g, 'е')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private resolveCanonical(v: any): string {
    const s = this.normalizeStrong(v);
    const map = new Map<string, string>([
      ['магистральный распределительный газопровод', 'Магистральный распределительный газопровод'],
      ['точка подключения', 'Точка подключения'],
      ['мг рг кс ург', 'МГ (РГ, КС, УРГ)'],
      ['км', 'км'],
      ['период', 'Период'],
      ['загрузка', 'Загрузка (%)'],
      ['загрузка %', 'Загрузка (%)'],
      ['уровень загрузки', 'Загрузка (%)'],
      ['факт среднесут расход млн м3 сут', 'Факт. среднесут. расход, млн.м3/сут'],
      ['факт среднесут расход qср ф млн м3 сут', 'Факт. среднесут. расход, млн.м3/сут'],
      ['твпс млн м3 сут', 'ТВПС, млн. м3/сут'],
      ['технич возм проп способн qср р млн м3 сут', 'ТВПС, млн. м3/сут'],
    ]);
    if (map.has(s)) return map.get(s)!;
    return this.normalizeHeader(v);
  }

  private toNum(v: any): number | null {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    if (s === '' || s === '-') return null;
    const n = Number(s.replace(/\s+/g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }

  private toMonthStart(v: any): Date {
    if (v instanceof Date) return new Date(Date.UTC(v.getUTCFullYear(), v.getUTCMonth(), 1));
    const s = String(v).trim();
    const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s);
    if (m) return new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, 1));
    const ym = /^(\d{4})-(\d{1,2})$/.exec(s);
    if (ym) return new Date(Date.UTC(Number(ym[1]), Number(ym[2]) - 1, 1));
    const d = new Date(s);
    if (!isNaN(+d)) return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
    throw new BadRequestException(`Bad date: ${v}`);
  }

  private parsePeriodOrThrow(v: any, excelRow: number): Date {
    if (v instanceof Date) {
      return new Date(Date.UTC(v.getUTCFullYear(), v.getUTCMonth(), 1));
    }

    if (typeof v === 'number' && Number.isFinite(v)) {
      const dc: any = (XLSX as any)?.SSF?.parse_date_code?.(v);
      if (dc && typeof dc.y === 'number' && typeof dc.m === 'number') {
        const mm = dc.m;
        if (mm < 1 || mm > 12) {
          throw new BadRequestException(
            `Строка ${excelRow}: «Период» — месяц должен быть от 01 до 12. Получено: ${v}`,
          );
        }
        return new Date(Date.UTC(dc.y, mm - 1, 1));
      }
    }

    const s = String(v ?? '').trim();
    const m1 = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s);
    if (m1) {
      const dd = Number(m1[1]);
      const mm = Number(m1[2]);
      const yy = Number(m1[3]);
      if (mm < 1 || mm > 12) {
        throw new BadRequestException(
          `Строка ${excelRow}: «Период» — месяц должен быть от 01 до 12. Получено: ${s}`,
        );
      }
      return new Date(Date.UTC(yy, mm - 1, 1));
    }
    const m2 = /^(\d{4})-(\d{1,2})$/.exec(s);
    if (m2) {
      const yy = Number(m2[1]);
      const mm = Number(m2[2]);
      if (mm < 1 || mm > 12) {
        throw new BadRequestException(
          `Строка ${excelRow}: «Период» — месяц должен быть от 01 до 12. Получено: ${s}`,
        );
      }
      return new Date(Date.UTC(yy, mm - 1, 1));
    }

    throw new BadRequestException(
      `Строка ${excelRow}: «Период» должен быть в формате ДД.ММ.ГГГГ или ГГГГ-ММ. Получено: ${s}`,
    );
  }

  async ingestXlsx(buf: Buffer) {
    const wb = XLSX.read(buf, { type: 'buffer', cellDates: true, codepage: 65001 });
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (!ws) throw new BadRequestException('Empty workbook');

    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });
    if (!rows || rows.length < 2) throw new BadRequestException('No rows');

    const r0 = (rows[0] || []).map((c) => this.normalizeHeader(c));
    const r1 = (rows[1] || []).map((c) => this.normalizeHeader(c));

    const c0 = this.resolveCanonical(r0[0]);
    const c01 = this.resolveCanonical(r0[1]);
    const c02 = this.normalizeHeader(r0[2]);
    const c11 = this.resolveCanonical(r1[1]);
    const c12 = this.resolveCanonical(r1[2]);
    const c3 = this.resolveCanonical(r0[3]);
    const c4 = this.resolveCanonical(r0[4]);
    const c5 = this.resolveCanonical(r0[5]);
    const c6 = this.resolveCanonical(r0[6]);

    if (c0 !== 'Магистральный распределительный газопровод') {
      throw new BadRequestException(
        `Неверное название колонки A1. Ожидалось: «Магистральный распределительный газопровод». Получено: «${this.normalizeHeader(r0[0]) || '—'}».`,
      );
    }
    if (c01 !== 'Точка подключения') {
      throw new BadRequestException(
        `Неверное название колонки B1. Ожидалось: «Точка подключения». Получено: «${this.normalizeHeader(r0[1]) || '—'}».`,
      );
    }

    if (c11 !== 'МГ (РГ, КС, УРГ)') {
      throw new BadRequestException(
        `Неверный подзаголовок B2. Ожидалось: «МГ (РГ, КС, УРГ)». Получено: «${this.normalizeHeader(r1[1]) || '—'}».`,
      );
    }
    if (c12 !== 'км') {
      throw new BadRequestException(
        `Неверный подзаголовок C2. Ожидалось: «км». Получено: «${this.normalizeHeader(r1[2]) || '—'}».`,
      );
    }
    if (c3 !== 'Период') {
      throw new BadRequestException(
        `Неверное название колонки D1. Ожидалось: «Период». Получено: «${this.normalizeHeader(r0[3]) || '—'}».`,
      );
    }
    if (c4 !== 'Загрузка (%)') {
      throw new BadRequestException(
        `Неверное название колонки E1. Ожидалось: «Загрузка (%)» (допустим алиас «Уровень загрузки»). Получено: «${this.normalizeHeader(r0[4]) || '—'}».`,
      );
    }

    const effectiveHeader = [c0, c11, c12, c3, c4, c5, c6];
    const expectedHeader = [
      'Магистральный распределительный газопровод',
      'МГ (РГ, КС, УРГ)',
      'км',
      'Период',
      'Загрузка (%)',
      'Факт. среднесут. расход, млн.м3/сут',
      'ТВПС, млн. м3/сут',
    ];

    for (let i = 0; i < expectedHeader.length; i++) {
      if (effectiveHeader[i] !== expectedHeader[i]) {
        throw new BadRequestException(
          `Неверный заголовок в колонке #${i + 1}. Ожидалось: ${expectedHeader[i]}. Получено: ${effectiveHeader[i]}`,
        );
      }
    }

    const data = rows.slice(2);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (let i = 0; i < data.length; i++) {
      const r = data[i];
      const excelRow = i + 3;

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
      const period = this.parsePeriodOrThrow(periodRaw, excelRow);
      const load_level = this.toNum(loadRaw);
      const flow_mmscmd = this.toNum(flowRaw);
      const tvps_mmscmd = this.toNum(tvpsRaw);

      if (load_level !== null && (load_level < 0 || load_level > 100)) {
        throw new BadRequestException(
          `Строка ${excelRow}: «Загрузка (%)» должна быть в диапазоне 0–100. Получено: ${r[4]}`,
        );
      }
      if (flow_mmscmd !== null && flow_mmscmd < 0) {
        throw new BadRequestException(
          `Строка ${excelRow}: «Факт. среднесут. расход…» не может быть отрицательным. Получено: ${r[5]}`,
        );
      }
      if (tvps_mmscmd !== null && tvps_mmscmd < 0) {
        throw new BadRequestException(
          `Строка ${excelRow}: «ТВПС…» не может быть отрицательным. Получено: ${r[6]}`,
        );
      }

      const hasTooLongInteger = (n: number | null) =>
        n !== null && Math.floor(Math.abs(n)) >= 100000;

      if (hasTooLongInteger(flow_mmscmd)) {
        throw new BadRequestException(
          `Строка ${excelRow}: «Факт. среднесут. расход…» — слишком большое значение. Разрешено не более 5 цифр в целой части. Получено: ${r[5]}`,
        );
      }

      if (hasTooLongInteger(tvps_mmscmd)) {
        throw new BadRequestException(
          `Строка ${excelRow}: «ТВПС…» — слишком большое значение. Разрешено не более 5 цифр в целой части. Получено: ${r[6]}`,
        );
      }

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
