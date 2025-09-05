import { Controller, Get, Query } from '@nestjs/common';
import { RowsService } from './rows.service';
import { RowsQueryDto } from './dto/rows.query.dto';

@Controller('rows')
export class RowsController {
  constructor(private readonly service: RowsService) {}

  @Get()
  async getRows(@Query() q: RowsQueryDto) {
    return this.service.getRows(q);
  }
}
