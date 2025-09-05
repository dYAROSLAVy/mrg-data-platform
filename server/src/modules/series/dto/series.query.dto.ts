import { IsOptional, IsUUID, Matches } from 'class-validator';

export class SeriesQueryDto {
  @IsUUID('all')
  pipelineId!: string;

  @IsOptional()
  @IsUUID('all')
  pointId?: string;

  // YYYY-MM
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  from?: string;

  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  to?: string;
}
