import { baseApi } from '../../../shared/api/base-api';
import type { RowsQuery, RowsResponse } from '../model/types';

export const rowsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRows: build.query<RowsResponse, RowsQuery>({
      query: (params) => ({ url: '/rows', params }),

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { limit: _l, offset: _o, ...rest } = queryArgs as RowsQuery;
        return `${endpointName}|${JSON.stringify(rest)}`;
      },

      forceRefetch({ currentArg, previousArg }) {
        return JSON.stringify(currentArg) !== JSON.stringify(previousArg);
      },

      merge(currentCache, newItems) {
        Object.assign(currentCache, newItems);
      },
    }),
    getYears: build.query<number[], void>({
      query: () => ({ url: '/rows/years' }),
      transformResponse: (resp: number[]) => resp ?? [],
    }),
  }),
});

export const { useGetRowsQuery, useGetYearsQuery } = rowsApi;
