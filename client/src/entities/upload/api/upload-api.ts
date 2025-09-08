import { baseApi } from '../../../shared/api/base-api';

export type UploadXlsxResult = {
  inserted: number;
  updated: number;
  skipped: number;
};

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    uploadXlsx: build.mutation<UploadXlsxResult, File>({
      query: (file) => {
        const form = new FormData();
        form.append('file', file);
        return {
          url: '/upload/xlsx',
          method: 'POST',
          body: form,
        };
      },
      invalidatesTags: ['Rows'],
    }),
  }),
});

export const { useUploadXlsxMutation } = uploadApi;
