import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './shared/database/database.module';
import { UserModule } from './routes/user/user.module';
import { MediasModule } from './routes/medias/medias.module';
import { MediasV2Module } from './routes/medias-v2/medias-v2.module';
import { LoggerModule } from 'nestjs-pino';
import * as path from 'path';
import pino from 'pino';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './routes/auth/auth.module';
import { CmdModule } from './routes/cmd/cmd.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    LoggerModule.forRoot({
      pinoHttp: {
        serializers: {
          req(req: any) {
            return {
              method: req.method,
              url: req.url,
              query: req.query,
              params: req.params,
            }
          },
          res(res: any) {
            return {
              statusCode: res.statusCode,
            }
          },
        },
        stream: pino.destination({
          dest: path.resolve('logs/app.log'),
          sync: false, // Asynchronous logging
          mkdir: true, // Create the directory if it doesn't exist
        }),
      },
    }),

    DatabaseModule,


    //* Module Api
    AuthModule,
    UserModule,
    MediasModule,
    MediasV2Module,
    CmdModule,

    //* Shared 
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
