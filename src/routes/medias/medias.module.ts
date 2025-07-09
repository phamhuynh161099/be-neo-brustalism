import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MediasController } from './medias.controller';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MediasService } from './medias.service';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [MediasController],
  providers: [MediasService],
  exports: [MediasService],
})
export class MediasModule {}