import { baseApi } from '../../../shared/api/base-api';

export type SeriesPoint = { period: string; flow: number | null; tvps: number | null };

export const seriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSeries: build.query<SeriesPoint[], { pipelineId: string; from?: string; to?: string }>({
      query: (params) => ({ url: '/series', params }),
      transformResponse: (resp: {
        pipeline: { id: string; name: string };
        point: any;
        series: SeriesPoint[];
      }) => resp.series,
    }),
  }),
});

export const { useGetSeriesQuery } = seriesApi;
