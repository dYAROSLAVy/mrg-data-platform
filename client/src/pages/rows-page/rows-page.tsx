import * as React from 'react';
import { OrderBy, RowVM } from '../../entities/rows/model/types';
import { useDebounce } from '../../features/rows-table/lib/use-debounce';
import { UploadXlsx } from '../../features/upload-xlsx/ui/upload-xlsx';
import { SeriesModal } from '../../entities/series/ui/series-modal';
import { RowsTable } from '../../features/rows-table/ui/rows-table/rows-table';
import { RowsToolbar } from '../../features/rows-table/ui/rows-toolbar/rows-toolbar';
import { useGetRowsQuery, useGetYearsQuery } from '../../entities/rows/api/rows-api';
import './styles.css';
import { ScrollToTop } from '../../shared/ui/scroll-to-top/scroll-to-top';
export const RowsPage: React.FC = () => {
  const [year, setYear] = React.useState<string | undefined>(undefined);
  const [search, setSearch] = React.useState('');
  const [limit, setLimit] = React.useState(20);
  const [offset, setOffset] = React.useState(0);
  const [sort, setSort] = React.useState<OrderBy>('pipelineName:asc');
  const [loadBand, setLoadBand] = React.useState<'ok' | 'warn' | 'critical' | undefined>(undefined);
  const [chart, setChart] = React.useState<null | {
    pipelineId: string;
    pipelineName: string;
    pointName?: string;
    km?: number | string | null;
    year?: string;
    years?: string[];
  }>(null);

  const debouncedSearch = useDebounce(search, 300) as string;

  const { data, currentData, isLoading, isUninitialized, refetch } = useGetRowsQuery({
    year,
    search: debouncedSearch || undefined,
    limit,
    offset,
    sort,
    loadBand: loadBand || undefined,
  });

  const effective = currentData ?? data;
  const total = effective?.meta?.total ?? 0;

  const { data: years, refetch: refetchYears } = useGetYearsQuery();

  const hasAnyFilter = Boolean((search && search.trim()) || year || loadBand);

  const isInitialLoading = (isLoading || isUninitialized) && !effective;

  const disableUi = isInitialLoading || (total === 0 && !hasAnyFilter);

  const disableControls = isInitialLoading || total === 0;

  const openChart = React.useCallback(
    (row: RowVM) => {
      const rows = (effective?.data ?? []).filter(
        (r) => r.pipelineId === row.pipelineId && typeof (r as any).period === 'string',
      );
      const yearsForPipeline = Array.from(
        new Set(rows.map((r) => String((r as any).period).slice(0, 4))),
      ).sort((a, b) => Number(a) - Number(b));

      const effectiveYear = (year && year.trim()) || yearsForPipeline[0];

      setChart({
        pipelineId: row.pipelineId,
        pipelineName: row.pipelineName,
        pointName: row.pointName,
        km: row.km,
        year: effectiveYear,
        years: yearsForPipeline,
      });
    },
    [effective, year],
  );

  React.useEffect(() => {
    setOffset(0);
  }, [year, debouncedSearch, sort, limit, loadBand]);

  const onSearchChange = React.useCallback((v: string) => {
    setSearch(v);
    setOffset(0);
  }, []);
  const onYearChange = React.useCallback((v?: string) => {
    setYear(v);
    setOffset(0);
  }, []);
  const onLoadBandChange = React.useCallback((v?: 'ok' | 'warn' | 'critical') => {
    setLoadBand(v);
    setOffset(0);
  }, []);
  const onOrderChange = React.useCallback((v: 'pipelineName:asc' | 'pipelineName:desc') => {
    setSort(v as OrderBy);
    setOffset(0);
  }, []);
  const onLimitChange = React.useCallback((n: number) => {
    setLimit(n);
    setOffset(0);
  }, []);
  const onPageChange = React.useCallback((next: number) => setOffset(next), []);
  const onReset = React.useCallback(() => {
    setSearch('');
    setYear(undefined);
    setLoadBand(undefined);
    setSort('pipelineName:asc');
    setOffset(0);
  }, []);

  return (
    <div className="wrapper">
      <main>
        <h1 className="visually-hidden">Cервис загрузки данных МРГ</h1>
        <section className="mrg-data">
          <h2 className="visually-hidden">Загрузка данных и визуализация</h2>
          <div className="container">
            <div className="mrg-data__inner">
              <UploadXlsx
                onDone={() => {
                  refetch();
                  refetchYears();
                }}
              />

              <RowsToolbar
                disabled={disableUi}
                controlsDisabled={disableControls}
                search={search}
                onSearchChange={onSearchChange}
                year={year}
                years={years}
                onYearChange={onYearChange}
                loadBand={loadBand}
                onLoadBandChange={onLoadBandChange}
                order={sort as 'pipelineName:asc' | 'pipelineName:desc'}
                onOrderChange={onOrderChange}
                total={total}
                limit={limit}
                offset={offset}
                onLimitChange={onLimitChange}
                onPageChange={onPageChange}
                onReset={onReset}
              />

              <RowsTable
                rows={(effective?.data ?? []) as RowVM[]}
                loading={isInitialLoading}
                onChart={openChart}
              />
              <SeriesModal
                open={!!chart}
                onClose={() => setChart(null)}
                pipelineId={chart?.pipelineId || ''}
                pipelineName={chart?.pipelineName || ''}
                pointName={chart?.pointName}
                km={chart?.km as any}
                year={chart?.year}
                years={chart?.years}
              />
            </div>

            <ScrollToTop hide={!!chart} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default RowsPage;
