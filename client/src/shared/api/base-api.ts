import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type ApiTag = 'Rows';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Rows'],
  endpoints: () => ({}),
});
