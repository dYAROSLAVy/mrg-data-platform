export type OrderBy =
  | 'period:asc'
  | 'period:desc'
  | 'pipelineName:asc'
  | 'pipelineName:desc'
  | 'pointName:asc'
  | 'pointName:desc';

export type RowsQuery = {
  year: string;
  search?: string;
  limit: number;
  offset: number;
  sort: OrderBy;
};

export type RowVM = {
  id: string;
  pipelineId: string;
  pointId: string;
  pipelineName: string;
  pointName: string;
  km: number;
  period: string;
  flow: number;
  tvps: number;
  load: number;
};

export type RowsResponse = {
  data: RowVM[];
  meta: { total: number; limit: number; offset: number };
};
