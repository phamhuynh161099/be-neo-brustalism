import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
    AccessTokenPayload,
    AccessTokenPayloadCreate,
    RefreshTokenPayload,
    RefreshTokenPayloadCreate,
} from 'src/shared/types/jwt.type'
import { v4 as uuidv4 } from 'uuid'

import { ConfigService } from '@nestjs/config'
const envConfig = new ConfigService()

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) { }

    signAccessToken(payload: AccessTokenPayloadCreate) {
        return this.jwtService.sign(
            { ...payload, uuid: uuidv4() },
            {
                // secret: envConfig.get('ACCESS_TOKEN_SECRET'),
                secret: 'secret',
                // expiresIn: envConfig.get('ACCESS_TOKEN_EXPIRES_IN'),
                expiresIn: '30m',
                algorithm: 'HS256',
            },
        )
    }

    signRefreshToken(payload: RefreshTokenPayloadCreate) {
        return this.jwtService.sign(
            { ...payload, uuid: uuidv4() },
            {
                // secret: envConfig.get('REFRESH_TOKEN_SECRET'),
                secret: 'secret',
                // expiresIn: envConfig.get('REFRESH_TOKEN_EXPIRES_IN'),
                expiresIn: '30m',
                algorithm: 'HS256',
            },
        )
    }

    verifyAccessToken(token: string): Promise<AccessTokenPayload> {
        return this.jwtService.verifyAsync(token, {
            // secret: envConfig.get('ACCESS_TOKEN_SECRET'),
            secret: 'secret',
        })
    }

    verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
        return this.jwtService.verifyAsync(token, {
            // secret: envConfig.get('REFRESH_TOKEN_SECRET'),
            secret: 'secret',
        })
    }
}
