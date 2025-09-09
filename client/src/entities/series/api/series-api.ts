import { baseApi } from '../../../shared/api/base-api';

export type SeriesPoint = { period: string; flow: number | null; tvps: number | null };

export type GetSeriesArgs = {
  pipelineId: string;
  from?: string;
  to?: string;
  pointId?: string;
  year?: string;
};

export const seriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSeries: build.query<SeriesPoint[], GetSeriesArgs>({
      query: (args) => ({ url: '/series', params: args }),
      transformResponse: (resp: {
        pipeline: { id: string; name: string };
        point: any;
        series: SeriesPoint[];
      }) => resp.series,
    }),
  }),
});

export const { useGetSeriesQuery } = seriesApi;
