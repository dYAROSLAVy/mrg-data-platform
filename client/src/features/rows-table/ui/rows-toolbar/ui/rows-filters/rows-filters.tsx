import * as React from 'react';
import './styles.css';

export type LoadBand = 'ok' | 'warn' | 'critical';

type RowsFiltersProps = {
  className?: string;
  disabled?: boolean;
  forceSearchEnabled?: boolean;
  disableNonSearch?: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  year?: string;
  years?: number[];
  onYearChange: (v?: string) => void;
  loadBand?: LoadBand;
  onLoadBandChange: (v?: LoadBand) => void;
};

export const RowsFilters: React.FC<RowsFiltersProps> = ({
  className = '',
  disabled = false,
  forceSearchEnabled = false,
  disableNonSearch = false,
  search,
  onSearchChange,
  year,
  years,
  onYearChange,
  loadBand,
  onLoadBandChange,
}) => {
  return (
    <div
      className={className ? `${className} rows-filters` : 'rows-filters'}
      aria-disabled={disabled}
    >
      <label className="rows-filters__group">
        <span className="rows-filters__label">Поиск</span>
        <input
          id="search"
          type="search"
          className="rows-filters__input"
          placeholder="МРГ или точка"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={disabled && !forceSearchEnabled}
        />
      </label>

      <label className="rows-filters__group">
        <span className="rows-filters__label">Год</span>
        <select
          className="rows-filters__select"
          id="year"
          value={year ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            onYearChange(v === '' ? undefined : v);
          }}
          disabled={disabled || disableNonSearch}
        >
          <option value="">Все годы</option>
          {(years ?? []).map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </label>

      <label className="rows-filters__group">
        <span className="rows-filters__label">Загрузка</span>
        <select
          className="rows-filters__select"
          id="load-band"
          value={loadBand ?? ''}
          onChange={(e) => {
            const v = e.target.value as '' | LoadBand;
            onLoadBandChange(v === '' ? undefined : v);
          }}
          disabled={disabled || disableNonSearch}
        >
          <option value="">Все</option>
          <option value="ok">Низкая (&lt; 40%)</option>
          <option value="warn">Средняя (40–79%)</option>
          <option value="critical">Высокая (≥ 80%)</option>
        </select>
      </label>
    </div>
  );
};

export default RowsFilters;
