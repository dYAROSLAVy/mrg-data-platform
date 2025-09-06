import { baseApi } from '../../../shared/api/baseApi';
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
  }),
});

export const { useGetRowsQuery } = rowsApi;
