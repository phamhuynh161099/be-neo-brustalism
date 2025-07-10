import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { DatabaseModule } from 'src/shared/database/database.module'
import { AuthRepo } from './auth.repo'
@Module({
    imports: [DatabaseModule,],
    providers: [AuthService, AuthRepo],
    controllers: [AuthController],
})
export class AuthModule { }
