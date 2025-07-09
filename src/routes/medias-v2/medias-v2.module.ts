import { Module } from '@nestjs/common';

import { memoryStorage } from 'multer';
import { MediasV2Controller } from './medias-v2.controller';
import { MediasV2Service } from './media-v2.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
    imports: [
        MulterModule.register({
            storage: memoryStorage(),
        }),
    ],
    controllers: [MediasV2Controller],
    providers: [MediasV2Service],
    exports: [MediasV2Service],
})
export class MediasV2Module { }