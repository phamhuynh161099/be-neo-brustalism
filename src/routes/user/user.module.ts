import { Module } from '@nestjs/common'
import { UserController } from './user.controller';
import { DatabaseModule } from 'src/shared/database/database.module';
import { UserRepo } from './user.repo';
import { UserService } from './user.service';


@Module({
  imports: [DatabaseModule,],
  controllers: [UserController],
  providers: [UserRepo, UserService],
})
export class UserModule { }
