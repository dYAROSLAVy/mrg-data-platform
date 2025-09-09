import { baseApi } from '../../../shared/api/base-api';

export type SeriesPoint = { period: string; flow: number | null; tvps: number | null };

export type GetSeriesArgs = {
  pipelineId: string;
  from?: string;
  to?: string;
  pointId?: string;
  year?: string;
};

export type SeriesResponse = {
  pipeline: { id: string; name: string };
  point: { id: string; name: string; km: string | null } | null;
  series: SeriesPoint[];
};

export const seriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSeries: build.query<SeriesPoint[], GetSeriesArgs>({
      query: (args) => ({ url: '/series', params: args }),
      transformResponse: (resp: SeriesResponse) => resp.series,
    }),
  }),
});

export const { useGetSeriesQuery } = seriesApi;
