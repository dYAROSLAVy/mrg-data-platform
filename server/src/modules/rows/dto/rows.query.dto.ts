import { IsInt, IsOptional, IsString, IsUUID, Matches, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class RowsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }: { value?: string }) =>
    value === undefined ? undefined : parseInt(String(value), 10),
  )
  offset?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  @Transform(({ value }: { value?: string }) =>
    value === undefined ? undefined : parseInt(String(value), 10),
  )
  limit?: number = 100;

  @IsOptional()
  @Matches(/^\d{4}$/)
  year?: string;

  @IsOptional()
  @IsUUID()
  pipelineId?: string;

  @IsOptional()
  @IsUUID()
  pointId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Matches(/^(period|pipelineName|pointName|load|flow|tvps):(asc|desc)$/)
  sort?: string = 'period:asc';
}
