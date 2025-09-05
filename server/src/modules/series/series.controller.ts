import { Controller, Get, Query } from '@nestjs/common';
import { SeriesService } from './series.service';
import { SeriesQueryDto } from './dto/series.query.dto';

@Controller('series')
export class SeriesController {
  constructor(private readonly service: SeriesService) {}

  @Get()
  async getSeries(@Query() q: SeriesQueryDto) {
    return this.service.getSeries(q);
  }
}
