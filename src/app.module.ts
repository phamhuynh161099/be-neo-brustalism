import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './shared/database/database.module';
import { UserModule } from './routes/user/user.module';
import { MediasModule } from './routes/medias/medias.module';
import { MediasV2Module } from './routes/medias-v2/medias-v2.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UserModule,
    MediasModule,
    MediasV2Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
