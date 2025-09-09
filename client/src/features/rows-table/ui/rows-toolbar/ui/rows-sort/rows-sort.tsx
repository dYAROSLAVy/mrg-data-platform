import * as React from 'react';
import './styles.css';

export type RowsOrder = 'pipelineName:asc' | 'pipelineName:desc';

type RowsSortProps = {
  className?: string;
  order: RowsOrder;
  onChange: (v: RowsOrder) => void;
  disabled?: boolean;
};

export const RowsSort: React.FC<RowsSortProps> = ({
  className = '',
  order,
  onChange,
  disabled = false,
}) => {
  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    onChange(e.target.value as RowsOrder);
  };

  return (
    <div className={className ? `${className} rows-sort` : 'rows-sort'} aria-disabled={disabled}>
      <label className="rows-sort__group">
        <span className="rows-sort__label">Сортировка</span>
        <select
          className="rows-sort__select"
          id="order"
          value={order}
          onChange={handleChange}
          disabled={disabled}
        >
          <option value="pipelineName:asc">МРГ (А→Я)</option>
          <option value="pipelineName:desc">МРГ (Я→А)</option>
        </select>
      </label>
    </div>
  );
};

export default RowsSort;
