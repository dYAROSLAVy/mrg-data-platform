import * as React from 'react';
import './styles.css';
import { OrderBy, RowVM } from '../../entities/rows/model/types';
import { useDebounce } from '../../features/rows-table/lib/use-debounce';
import { UploadXlsx } from '../../features/upload-xlsx/ui/upload-xlsx';
import SeriesModal from '../../entities/series/ui/series-modal';
import { RowsTable } from '../../features/rows-table/ui/rows-table/rows-table';
import { useGetRowsQuery } from '../../entities/rows/api/rows-api';

export const RowsPage: React.FC = () => {
  const [year, setYear] = React.useState('2022');
  const [search, setSearch] = React.useState('');
  const [limit, setLimit] = React.useState(100);
  const [offset, setOffset] = React.useState(0);
  const [sort, setSort] = React.useState<OrderBy>('pipelineName:asc');
  const [loadBand, setLoadBand] = React.useState<'ok' | 'warn' | 'critical' | undefined>(undefined);
  const [chart, setChart] = React.useState<null | { pipelineId: string; pipelineName: string }>(
    null,
  );

  const debouncedSearch = useDebounce(search, 300) as string;

  const { data, isFetching, refetch } = useGetRowsQuery({
    year,
    search: debouncedSearch || undefined,
    limit,
    offset,
    sort,
    loadBand: loadBand || undefined,
  });

  const toggleSort = (key: 'period' | 'pipelineName' | 'pointName') => {
    const safeKey: 'pipelineName' = 'pipelineName';
    setSort((prev) => {
      const [k, d = 'asc'] = (prev ?? 'pipelineName:asc').split(':') as [
        'pipelineName',
        'asc' | 'desc',
      ];
      const next = k === safeKey && d === 'asc' ? 'desc' : 'asc';
      return `${safeKey}:${next}` as OrderBy;
    });
    setOffset(0);
  };

  const openChart = (row: RowVM) => {
    setChart({ pipelineId: row.pipelineId, pipelineName: row.pipelineName });
  };

  React.useEffect(() => {
    setOffset(0);
  }, [year, debouncedSearch, sort, limit, loadBand]);

  return (
    <div className="wrapper">
      <main>
        <h1 className="visually-hidden">Cервис загрузки данных МРГ</h1>
        <section className="mrg-data">
          <h2 className="visually-hidden">Загрузка данных и визуализация</h2>
          <div className="container">
            <div className="mrg-data__inner">
              <UploadXlsx className="mrg-data__upload" onDone={() => refetch()} />
              <div
                className="rows-filters"
                style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '12px 0' }}
              >
                <label>
                  Поиск:{' '}
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="МРГ или точка"
                  />
                </label>
                <label>
                  Год:{' '}
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    inputMode="numeric"
                    pattern="\\d{4}"
                    placeholder="YYYY"
                    style={{ width: 90 }}
                  />
                </label>
                <label>
                  Загрузка:{' '}
                  <select
                    value={loadBand ?? ''}
                    onChange={(e) => {
                      const v = e.target.value as '' | 'ok' | 'warn' | 'critical';
                      setLoadBand(v === '' ? undefined : v);
                      setOffset(0);
                    }}
                  >
                    <option value="">Все</option>
                    <option value="ok">Низкая (&lt; 40%)</option>
                    <option value="warn">Средняя (40–79%)</option>
                    <option value="critical">Высокая (≥ 80%)</option>
                  </select>
                </label>
              </div>
              <RowsTable
                rows={data?.data ?? []}
                loading={isFetching}
                sort={sort}
                onSort={toggleSort}
                meta={data?.meta ?? { total: 0, limit, offset }}
                onPage={(newOffset) => setOffset(newOffset)}
                onChart={openChart}
                limit={limit}
                onLimitChange={(v) => {
                  setLimit(v);
                  setOffset(0);
                }}
              />
              <SeriesModal
                open={!!chart}
                onClose={() => setChart(null)}
                pipelineId={chart?.pipelineId || ''}
                pipelineName={chart?.pipelineName || ''}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RowsPage;
