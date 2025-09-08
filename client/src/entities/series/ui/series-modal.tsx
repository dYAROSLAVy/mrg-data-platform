import React from 'react';
import { useGetSeriesQuery } from '../api/series-api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

type Props = { open: boolean; onClose: () => void; pipelineId: string; pipelineName: string };

export const SeriesModal: React.FC<Props> = ({ open, onClose, pipelineId, pipelineName }) => {
  const { data, isFetching, isError } = useGetSeriesQuery({ pipelineId }, { skip: !open });
  const fmt = (ym: string) => {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  };
  if (!open) return null;
  return (
    <div>
      <div>
        <div>
          <h3>График — {pipelineName}</h3>
          <button onClick={onClose}>×</button>
        </div>
        <div>
          {isFetching ? (
            'Загрузка…'
          ) : isError ? (
            'Ошибка'
          ) : !data || data.length === 0 ? (
            'Нет данных'
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tickFormatter={fmt} />
                <YAxis />
                <Tooltip labelFormatter={(v) => fmt(String(v))} />
                <Legend />
                <Line type="monotone" dataKey="flow" name="Факт" dot={false} />
                <Line type="monotone" dataKey="tvps" name="ТВПС" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesModal;
