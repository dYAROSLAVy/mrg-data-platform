import React from 'react';
import { useGetSeriesQuery } from '../api/series-api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import './styles.css';

type Props = {
  open: boolean;
  onClose: () => void;
  pipelineId: string;
  pipelineName: string;
  pointName?: string;
  km?: number | string | null;
  year?: string;
  years?: string[];
};

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const SeriesModal: React.FC<Props> = ({
  open,
  onClose,
  pipelineId,
  pipelineName,
  pointName,
  km,
  year,
  years,
}) => {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const prevFocusRef = React.useRef<HTMLElement | null>(null);

  const [selectedYear, setSelectedYear] = React.useState<string | undefined>(year);

  React.useEffect(() => {
    setSelectedYear(year ?? (Array.isArray(years) && years.length ? years[0] : undefined));
  }, [open, year, years]);

  const { data, isFetching, isError } = useGetSeriesQuery(
    { pipelineId, year: selectedYear && selectedYear.trim() ? selectedYear : undefined },
    { skip: !open },
  );
  const fmtTick = (ym: string) => {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, (m || 1) - 1, 1);
    return d
      .toLocaleDateString('ru-RU', { month: 'short' })
      .replace('\u00A0', ' ')
      .replace('.', '');
  };
  const fmtTooltip = (ym: string) => {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, (m || 1) - 1, 1);
    return d
      .toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })
      .replace('\u00A0', ' ')
      .replace('.', '');
  };
  const fmtKm = (v: number | string | null | undefined) => {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(n);
  };

  React.useEffect(() => {
    if (!open) return;

    prevFocusRef.current = document.activeElement as HTMLElement | null;

    const focusTarget = closeBtnRef.current || cardRef.current;
    if (focusTarget) {
      setTimeout(() => focusTarget.focus?.(), 0);
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const root = cardRef.current;
        if (!root) return;
        const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (n) => !n.hasAttribute('disabled'),
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first || !root.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last || !root.contains(active)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown, true);

      const prev = prevFocusRef.current;
      if (prev && typeof prev.focus === 'function') {
        setTimeout(() => prev.focus(), 0);
      }
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="series-modal" role="dialog" aria-modal="true" aria-labelledby="series-title">
      <div className="series-modal__backdrop" onClick={onClose} />
      <div className="series-modal__card" ref={cardRef} tabIndex={-1}>
        <div className="series-modal__header">
          <div>
            <h3 id="series-title" className="series-modal__title">
              Загрузка МРГ
            </h3>
            <p className="series-modal__subtitle">
              {pipelineName}. Подача газа от {fmtKm(km)} км {pointName}
              <br />
              млн м³/сут.
            </p>
          </div>
          {Array.isArray(years) && years.length > 0 && (
            <label className="series-modal__year">
              <span className="visually-hidden">Год</span>
              <select
                className="series-modal__year-select"
                value={selectedYear ?? ''}
                onChange={(e) => setSelectedYear(e.target.value || undefined)}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y} г
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            className="series-modal__close"
            onClick={onClose}
            aria-label="Закрыть"
            ref={closeBtnRef}
          >
            ×
          </button>
        </div>
        <div className="series-modal__body">
          {isFetching ? (
            'Загрузка…'
          ) : isError ? (
            'Ошибка'
          ) : !data || data.length === 0 ? (
            'Нет данных'
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={data} margin={{ top: 10, right: 24, bottom: 36, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="period"
                  tickFormatter={fmtTick}
                  tickMargin={8}
                  minTickGap={24}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <Tooltip labelFormatter={(v) => fmtTooltip(String(v))} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="flow"
                  name="Факт"
                  stroke="#2563eb"
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="tvps"
                  name="ТВПС"
                  stroke="#ef4444"
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesModal;
