import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('xlsx')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const ok =
          file?.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file?.mimetype === 'application/zip' ||
          /\.xlsx$/i.test(file?.originalname || '');
        cb(ok ? null : new BadRequestException('Ожидается файл .xlsx'), ok);
      },
    }),
  )
  async uploadXlsx(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 10 * 1024 * 1024 })
        .addFileTypeValidator({
          fileType:
            /(?:application\/(?:vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|zip))$/,
        })
        .build({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    file: Express.Multer.File,
  ) {
    return this.uploadService.ingestXlsx(file.buffer);
  }
}
