import * as React from 'react';
import { Pagination } from '../../../../shared/ui/pagination/pagination';
import './styles.css';

type Meta = { total: number; limit: number; offset: number };

type TableControlsProps = {
  meta: Meta;
  limit: number;
  onLimitChange: (v: number) => void;
  onPage: (offset: number) => void;
  className?: string;
};

export const TableControls: React.FC<TableControlsProps> = React.memo(
  ({ meta, limit, onLimitChange, onPage, className }) => {
    return (
      <div className={`${className ?? ''} table-controls`}>
        <label className="table-controls__label">
          Записей на странице:{' '}
          <select
            className="table-controls__select"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
          >
            {[20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <Pagination total={meta.total} limit={meta.limit} offset={meta.offset} onChange={onPage} />
      </div>
    );
  },
);
