import * as React from 'react';
import { RowsSort, RowsOrder } from './ui/rows-sort/rows-sort';
import { TableControls } from '../table-controls/table-controls';
import { LoadBand, RowsFilters } from './ui/rows-filters/rows-filters';
import './styles.css';

export type RowsToolbarProps = {
  className?: string;
  disabled?: boolean;
  controlsDisabled?: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  year?: string;
  years?: number[];
  onYearChange: (v?: string) => void;
  loadBand?: LoadBand;
  onLoadBandChange: (v?: LoadBand) => void;
  order: RowsOrder;
  onOrderChange: (v: RowsOrder) => void;
  total: number;
  limit: number;
  offset: number;
  onLimitChange: (n: number) => void;
  onPageChange: (offset: number) => void;
  onReset: () => void;
};

export const RowsToolbar: React.FC<RowsToolbarProps> = ({
  className = '',
  disabled = false,
  controlsDisabled,
  search,
  onSearchChange,
  year,
  years,
  onYearChange,
  loadBand,
  onLoadBandChange,
  order,
  onOrderChange,
  total,
  limit,
  offset,
  onLimitChange,
  onPageChange,
  onReset,
}) => {
  const tableDisabled = controlsDisabled ?? disabled;
  const noData = (total ?? 0) === 0;
  const hasSearch = Boolean(search && search.trim());
  const lockAllButSearch = !disabled && noData && hasSearch;
  return (
    <div
      className={className ? `${className} rows-toolbar` : 'rows-toolbar'}
      aria-disabled={disabled}
      style={disabled ? { pointerEvents: 'none', opacity: 0.6 } : undefined}
    >
      <div className="rows-toolbar__inner">
        <RowsFilters
          disabled={disabled || lockAllButSearch}
          forceSearchEnabled={lockAllButSearch}
          disableNonSearch={lockAllButSearch}
          search={search}
          onSearchChange={onSearchChange}
          year={year}
          years={years}
          onYearChange={onYearChange}
          loadBand={loadBand}
          onLoadBandChange={onLoadBandChange}
        />

        <RowsSort order={order} onChange={onOrderChange} disabled={disabled || lockAllButSearch} />

        <button
          className="rows-toolbar__reset"
          type="button"
          onClick={onReset}
          disabled={disabled && !lockAllButSearch}
        >
          Сбросить
        </button>
      </div>

      <TableControls
        className="rows-toolbar__controls"
        disabled={tableDisabled || lockAllButSearch}
        limit={limit}
        onLimitChange={(n) => {
          onLimitChange(n);
        }}
        meta={{ total, limit, offset }}
        onPage={(next) => onPageChange(next)}
      />
    </div>
  );
};

export default RowsToolbar;
