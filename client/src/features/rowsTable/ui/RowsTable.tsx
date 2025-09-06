import * as React from 'react';
import type { RowVM, OrderBy } from '../../../entities/rows/model/types';
import { Pagination } from '../../../shared/ui/Pagination';

type RowsTableProps = {
  rows: RowVM[];
  loading: boolean;
  sort?: OrderBy;
  onSort: (key: 'period' | 'pipelineName' | 'pointName') => void;
  meta: { total: number; limit: number; offset: number };
  onPage: (offset: number) => void;
  onChart: (row: RowVM) => void;
};

function SortArrow({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <span aria-hidden style={{ marginLeft: 4, opacity: active ? 1 : 0.25 }}>
      {dir === 'asc' ? '↑' : '↓'}
    </span>
  );
}

export const RowsTable: React.FC<RowsTableProps> = ({
  rows,
  loading,
  sort,
  onSort,
  meta,
  onPage,
  onChart,
}) => {
  const [sortKey, sortDir] = (sort ?? 'period:asc').split(':') as [
    'period' | 'pipelineName' | 'pointName',
    'asc' | 'desc'
  ];

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>
              <button type="button" onClick={() => onSort('pipelineName')}>
                МГРП
                <SortArrow active={sortKey === 'pipelineName'} dir={sortDir} />
              </button>
            </th>
            <th style={{ textAlign: 'left' }}>
              <button type="button" onClick={() => onSort('pointName')}>
                Точка
                <SortArrow active={sortKey === 'pointName'} dir={sortDir} />
              </button>
            </th>
            <th>км</th>
            <th>
              <button type="button" onClick={() => onSort('period')}>
                Период
                <SortArrow active={sortKey === 'period'} dir={sortDir} />
              </button>
            </th>
            <th>Факт (млн м³/сут)</th>
            <th>Техн. спос. (млн м³/сут)</th>
            <th>Загрузка (%)</th>
            <th>График</th>
          </tr>
        </thead>
        <tbody>
          {loading && rows.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ padding: 12 }}>Загрузка…</td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ padding: 12 }}>Нет данных</td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id}>
                <td>{r.pipelineName}</td>
                <td>{r.pointName}</td>
                <td>{r.km}</td>
                <td>{r.period}</td>
                <td>{r.flow}</td>
                <td>{r.tvps}</td>
                <td>{r.load}</td>
                <td>
                  <button type="button" onClick={() => onChart(r)}>график</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Pagination
        total={meta.total}
        limit={meta.limit}
        offset={meta.offset}
        onChange={(nextOffset) => onPage(nextOffset)}
      />
    </div>
  );
};
