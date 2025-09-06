import * as React from 'react';
import { useGetRowsQuery } from '../../../entities/rows/api/rowsApi';
import type { OrderBy, RowVM } from '../../../entities/rows/model/types';
import { RowsFilters } from './RowsFilters';
import { RowsTable } from './RowsTable';
import { useDebounce } from '../lib/useDebounce';
import { UploadXlsx } from '../../uploadXlsx/ui/UploadXlsx';

export const RowsPage: React.FC = () => {
  const [year, setYear] = React.useState('2022');
  const [search, setSearch] = React.useState('');
  const [limit, setLimit] = React.useState(100);
  const [offset, setOffset] = React.useState(0);
  const [sort, setSort] = React.useState<OrderBy>('period:asc');

  const debouncedSearch = useDebounce(search, 300) as string;

  const { data, isFetching, refetch } = useGetRowsQuery({
    year,
    search: debouncedSearch || undefined,
    limit,
    offset,
    sort,
  });

  const toggleSort = (key: 'period' | 'pipelineName' | 'pointName') => {
    setSort((prev) => {
      const [k, d = 'asc'] = (prev ?? 'period:asc').split(':') as [typeof key, 'asc' | 'desc'];
      const next = k === key && d === 'asc' ? 'desc' : 'asc';
      return `${key}:${next}` as OrderBy;
    });
    setOffset(0);
  };

  const openChart = (row: RowVM) => {
    const params = new URLSearchParams({
      pipelineId: row.pipelineId,
      pointId: row.pointId,
      from: `${year}-01`,
      to: `${year}-12`,
    });
    window.open(`/api/series?${params.toString()}`, '_blank');
  };

  React.useEffect(() => {
    setOffset(0);
  }, [year, debouncedSearch, sort, limit]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <UploadXlsx onDone={() => refetch()} />
      </div>
      <RowsFilters
        year={year}
        onYearChange={setYear}
        search={search}
        onSearchChange={setSearch}
        limit={limit}
        onLimitChange={(v) => {
          setLimit(v);
          setOffset(0);
        }}
        onRefresh={refetch}
      />

      <RowsTable
        rows={data?.data ?? []}
        loading={isFetching}
        sort={sort}
        onSort={toggleSort}
        meta={data?.meta ?? { total: 0, limit, offset }}
        onPage={(newOffset) => setOffset(newOffset)}
        onChart={openChart}
      />
    </div>
  );
};

export default RowsPage;
