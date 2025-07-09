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
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MediasV2Service } from './media-v2.service';
import { FileValidationInterceptor } from './file-validation.interceptor';
import { FileExceptionFilter } from './file-exception.filter';

@Controller('medias-v2')
@UseFilters(FileExceptionFilter)
export class MediasV2Controller {
    constructor(private readonly mediasV2Service: MediasV2Service) { }

    @Post('upload/single')
    @UseInterceptors(FileInterceptor('file'), FileValidationInterceptor)
    async uploadSingleFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const result = await this.mediasV2Service.uploadSingleFile(file);
        return {
            success: true,
            message: 'File uploaded successfully',
            data: result,
        };
    }

    @Post('upload/multiple')
    @UseInterceptors(FilesInterceptor('files', 10), FileValidationInterceptor)
    async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files uploaded');
        }

        const results = await this.mediasV2Service.uploadMultipleFiles(files);
        return {
            success: true,
            message: 'Files uploaded successfully',
            data: results,
        };
    }

    @Get('download/:filename')
    async downloadFile(@Param('filename') filename: string, @Res() res: Response) {
        return this.mediasV2Service.downloadFile(filename, res);
    }

    @Get('view/:filename')
    async viewFile(@Param('filename') filename: string, @Res() res: Response) {
        return this.mediasV2Service.viewFile(filename, res);
    }

    @Delete(':filename')
    async deleteFile(@Param('filename') filename: string) {
        await this.mediasV2Service.deleteFile(filename);
        return {
            success: true,
            message: 'File deleted successfully',
        };
    }

    @Get('list')
    async listFiles() {
        const files = await this.mediasV2Service.listFiles();
        return {
            success: true,
            data: files,
        };
    }
}