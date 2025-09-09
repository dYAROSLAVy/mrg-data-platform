import * as React from 'react';
import { OrderBy, RowVM } from '../../entities/rows/model/types';
import { useDebounce } from '../../features/rows-table/lib/use-debounce';
import { UploadXlsx } from '../../features/upload-xlsx/ui/upload-xlsx';
import { SeriesModal } from '../../entities/series/ui/series-modal';
import { RowsTable } from '../../features/rows-table/ui/rows-table/rows-table';
import { RowsToolbar } from '../../features/rows-table/ui/rows-toolbar/rows-toolbar';
import { useGetRowsQuery, useGetYearsQuery } from '../../entities/rows/api/rows-api';
import './styles.css';
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

  const { data, isFetching, refetch } = useGetRowsQuery({
    year,
    search: debouncedSearch || undefined,
    limit,
    offset,
    sort,
    loadBand: loadBand || undefined,
  });

  const { data: years, refetch: refetchYears } = useGetYearsQuery();

  const hasAnyFilter = Boolean((search && search.trim()) || year || loadBand);

  const disableUi = isFetching || ((data?.meta?.total ?? 0) === 0 && !hasAnyFilter);

  const disableControls = isFetching || (data?.meta?.total ?? 0) === 0;

  const openChart = (row: RowVM) => {
    const yearsForPipeline = Array.from(
      new Set(
        (data?.data ?? [])
          .filter((r) => r.pipelineId === row.pipelineId && typeof (r as any).period === 'string')
          .map((r) => String((r as any).period).slice(0, 4)),
      ),
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
                onSearchChange={(v) => {
                  setSearch(v);
                  setOffset(0);
                }}
                year={year}
                years={years}
                onYearChange={(v) => {
                  setYear(v);
                  setOffset(0);
                }}
                loadBand={loadBand}
                onLoadBandChange={(v) => {
                  setLoadBand(v);
                  setOffset(0);
                }}
                order={sort as 'pipelineName:asc' | 'pipelineName:desc'}
                onOrderChange={(v) => {
                  setSort(v as OrderBy);
                  setOffset(0);
                }}
                total={data?.meta?.total ?? 0}
                limit={limit}
                offset={offset}
                onLimitChange={(n) => {
                  setLimit(n);
                  setOffset(0);
                }}
                onPageChange={(next) => setOffset(next)}
                onReset={() => {
                  setSearch('');
                  setYear(undefined);
                  setLoadBand(undefined);
                  setSort('pipelineName:asc');
                  setOffset(0);
                }}
              />

              <RowsTable rows={data?.data ?? []} loading={isFetching} onChart={openChart} />
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
          </div>
        </section>
      </main>
    </div>
  );
};

export default RowsPage;
