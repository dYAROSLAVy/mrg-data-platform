import * as React from 'react';
import type { RowVM } from '../../../../entities/rows/model/types';
import './styles.css';
import { formatFixed2, formatKm, formatPeriod } from '../../../../shared/utils';
import { LoadMeter } from '../../../../shared/ui/load-meter/load-meter';

type RowsTableProps = {
  rows: RowVM[];
  loading: boolean;
  onChart: (row: RowVM) => void;
};

export const RowsTable: React.FC<RowsTableProps> = ({ rows, loading, onChart }) => {
  return (
    <div className="mrg-table">
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
          <caption className="visually-hidden">Сводная таблица МРГ</caption>

          <thead>
            <tr className="mrg-table__tr">
              <th className="mrg-table__th" rowSpan={2}>
                Магистральный распределительный газопровод
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
                      className="mrg-table__chart-btn"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M0.75 0C1.16421 0 1.5 0.335786 1.5 0.75V18H18.75C19.1642 18 19.5 18.3358 19.5 18.75C19.5 19.1642 19.1642 19.5 18.75 19.5H0.75C0.335786 19.5 0 19.1642 0 18.75V0.75C0 0.335786 0.335786 0 0.75 0Z"
                          fill="#1C1B1E"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M19.0724 0.0730295C19.4463 0.251114 19.6051 0.698648 19.4271 1.07263L14.4271 11.5726C14.3253 11.7863 14.1287 11.9394 13.8966 11.9857C13.6644 12.032 13.4241 11.966 13.2482 11.8076L8.98028 7.96652L5.42074 15.0856C5.2355 15.4561 4.78499 15.6062 4.41451 15.421C4.04403 15.2358 3.89386 14.7852 4.0791 14.4148L8.0791 6.41476C8.18381 6.20534 8.38031 6.05684 8.61036 6.01327C8.84041 5.96971 9.07761 6.03607 9.25164 6.1927L13.5048 10.0205L18.0728 0.427725C18.2509 0.0537476 18.6984 -0.105055 19.0724 0.0730295Z"
                          fill="#1C1B1E"
                        />
                      </svg>
                      <span className="visually-hidden">График</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
