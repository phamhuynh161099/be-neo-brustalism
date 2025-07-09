import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;
    const files = request.files;

    if (file) {
      this.validateSingleFile(file);
    }

    if (files && Array.isArray(files)) {
      files.forEach(f => this.validateSingleFile(f));
    }

    return next.handle();
  }

  private validateSingleFile(file: Express.Multer.File) {
    // Custom validation logic
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|bmp|tiff|pdf|doc|docx|txt|rtf|xls|xlsx|csv|ppt|pptx)$/i)) {
      throw new BadRequestException('Invalid file extension');
    }
  }
}