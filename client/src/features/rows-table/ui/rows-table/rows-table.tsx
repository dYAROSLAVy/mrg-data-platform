import * as React from 'react';
import type { RowVM, OrderBy } from '../../../../entities/rows/model/types';
import { TableControls } from '../table-controls/table-controls';
import './styles.css';
import { formatFixed2, formatKm, formatPeriod } from '../../../../shared/utils';
import { LoadMeter } from '../../../../shared/ui/load-meter/load-meter';

type RowsTableProps = {
  rows: RowVM[];
  loading: boolean;
  sort?: OrderBy;
  onSort: (key: 'period' | 'pipelineName' | 'pointName') => void;
  meta: { total: number; limit: number; offset: number };
  onPage: (offset: number) => void;
  onChart: (row: RowVM) => void;
  limit: number;
  onLimitChange: (v: number) => void;
};

export const RowsTable: React.FC<RowsTableProps> = ({
  rows,
  loading,
  sort,
  onSort,
  meta,
  onPage,
  onChart,
  limit,
  onLimitChange,
}) => {
  return (
    <div className="mrg-table">
      {rows.length > 0 && (
        <TableControls
          className="mrg-table__controls"
          limit={limit}
          onLimitChange={onLimitChange}
          meta={meta}
          onPage={onPage}
        />
      )}

      <div className="mrg-table__scroller">
        <table className="mrg-table__table">
          <colgroup>
            <col className="mrg-table__col mrg-table__col--pipeline" />
            <col className="mrg-table__col mrg-table__col--point" />
            <col className="mrg-table__col mrg-table__col--km" />
            <col className="mrg-table__col mrg-table__col--period" />
            <col className="mrg-table__col mrg-table__col--num" />
            <col className="mrg-table__col mrg-table__col--num" />
            <col className="mrg-table__col mrg-table__col--num" />
            <col className="mrg-table__col mrg-table__col--actions" />
          </colgroup>
          <caption className="visually-hidden">
            Сводная таблица МРГ (всего {meta.total} записей)
          </caption>

          <thead>
            <tr className="mrg-table__tr">
              <th className="mrg-table__th" rowSpan={2}>
                <button
                  type="button"
                  className="mrg-table__sort-btn"
                  onClick={() => onSort('pipelineName')}
                >
                  Магистральный распределительный газопровод
                </button>
              </th>
              <th className="mrg-table__th" colSpan={2}>
                Точка подключения
              </th>
              <th className="mrg-table__th" rowSpan={2}>
                Период
              </th>
              <th className="mrg-table__th" rowSpan={2}>
                Загрузка (%)
              </th>
              <th className="mrg-table__th" rowSpan={2}>
                Факт. среднесут. расход (qср.ф) млн.м³/сут
              </th>
              <th className="mrg-table__th" rowSpan={2}>
                Технич. возм. проп. способн. (qср.р) млн.м³/сут
              </th>
              <th className="mrg-table__th" rowSpan={2}>
                График
              </th>
            </tr>
            <tr className="mrg-table__tr">
              <th className="mrg-table__th">МГ (РГ, КС, УРГ)</th>
              <th className="mrg-table__th">км</th>
            </tr>
          </thead>

          <tbody>
            {loading && rows.length === 0 ? (
              <tr className="mrg-table__tr">
                <td colSpan={8} role="status">
                  Загрузка…
                </td>
              </tr>
            ) : !loading && rows.length === 0 ? (
              <tr className="mrg-table__tr">
                <td className="mrg-table__td mrg-table__td--empty" colSpan={8}>
                  Нет данных
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr className="mrg-table__tr" key={r.id}>
                  <td className="mrg-table__td">{r.pipelineName}</td>
                  <td className="mrg-table__td">{r.pointName}</td>
                  <td className="mrg-table__td">{formatKm(r.km)}</td>
                  <td className="mrg-table__td">{formatPeriod(r.period)}</td>
                  <td className="mrg-table__td">
                    <LoadMeter value={r.load} warn={40} critical={80} />
                  </td>
                  <td className="mrg-table__td"> {formatFixed2(r.flow)}</td>
                  <td className="mrg-table__td">{formatFixed2(r.tvps)}</td>
                  <td className="mrg-table__td">
                    <button
                      type="button"
                      onClick={() => onChart(r)}
                      aria-label={`Открыть график: ${r.pipelineName}`}
                    >
                      график
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <TableControls
          className="mrg-table__controls mrg-table__controls--bottom"
          limit={limit}
          onLimitChange={onLimitChange}
          meta={meta}
          onPage={onPage}
        />
      )}
    </div>
  );
};
