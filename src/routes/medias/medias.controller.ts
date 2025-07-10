import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Get,
  Param,
  Res,
  Delete,
  UseFilters,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediasService } from './medias.service';
import { Response } from 'express';
import { FileValidationInterceptor } from './file-validation.interceptor';
import { FileExceptionFilter } from './file-exception.filter';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('medias')
@ApiTags('Medias')
@ApiBearerAuth('JWT-auth')
@UseFilters(FileExceptionFilter)
export class MediasController {
  constructor(private readonly mediasService: MediasService) { }

  @Post('upload/single')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          description: 'folder muốn lưu trữ - demo'
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'), FileValidationInterceptor)
  async uploadSingleFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      folder: string
    }
  ) {
    console.log('folder', body.folder)
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.mediasService.uploadSingleFile(file);
    return {
      success: true,
      message: 'File uploaded successfully',
      data: result,
    };
  }

  @Post('upload/multiple')
  @ApiOperation({ summary: 'Upload nhiều file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10), FileValidationInterceptor)
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const results = await this.mediasService.uploadMultipleFiles(files);
    return {
      success: true,
      message: 'Files uploaded successfully',
      data: results,
    };
  }

  @Get('list')
  async listFiles() {
    console.log('run api get: medias/list')
    const files = await this.mediasService.listFiles();
    return {
      success: true,
      data: files,
    };
  }

  @Get('download/:filename')
  async downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    return this.mediasService.downloadFile(filename, res);
  }

  @Get('view/:filename')
  async viewFile(@Param('filename') filename: string, @Res() res: Response) {
    return this.mediasService.viewFile(filename, res);
  }

  @Delete(':filename')
  async deleteFile(@Param('filename') filename: string) {
    await this.mediasService.deleteFile(filename);
    return {
      success: true,
      message: 'File deleted successfully',
    };
  }

}