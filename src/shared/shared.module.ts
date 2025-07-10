import { Global, Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { HashingService } from './services/hashing.service'
import { AccessTokenGuard } from './guards/access-token.guard'
import { AuthenticationGuard } from './guards/authentication.guard'
import { JwtModule } from '@nestjs/jwt'
import { TokenService } from './services/token.service'

const sharedServices = [
    HashingService,
    TokenService,
]

@Global()
@Module({
    providers: [
        ...sharedServices,
        AccessTokenGuard,
        {
            provide: APP_GUARD,
            useClass: AuthenticationGuard,
        },
    ],
    exports: sharedServices,
    imports: [JwtModule],
})
export class SharedModule { }
