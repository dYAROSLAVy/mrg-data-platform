export type RowsFiltersProps = {
  year: string;
  onYearChange: (v: string) => void;

  search: string;
  onSearchChange: (v: string) => void;

  limit: number;
  onLimitChange: (v: number) => void;

  onRefresh: () => void;
};

export const RowsFilters: React.FC<RowsFiltersProps> = ({
  year,
  onYearChange,
  search,
  onSearchChange,
  limit,
  onLimitChange,
  onRefresh,
}) => {
  return (
    <div>
      <label>
        Год:{' '}
        <select value={year} onChange={(e) => onYearChange(e.target.value)}>
          {['2021', '2022', '2023', '2024', '2025'].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>

      <input
        placeholder="поиск по трубам/точкам…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <label>
        На странице:{' '}
        <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}>
          {[20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <button type="button" onClick={onRefresh}>
        обновить
      </button>
    </div>
  );
};

export default RowsFilters;
