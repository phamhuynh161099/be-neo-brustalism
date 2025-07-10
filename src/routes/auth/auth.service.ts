import { HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { AuthRepo } from "./auth.repo";
import { HashingService } from "src/shared/services/hashing.service";
import { TokenService } from "src/shared/services/token.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly authRepo: AuthRepo,
        private readonly hashingService: HashingService,
        private readonly tokenService: TokenService,
    ) {

    }

    async login(body: {
        [k: string]: string
    }) {
        try {
            // 1. Lấy thông tin user, kiểm tra user có tồn tại hay không, mật khẩu có đúng không
            const user = await this.authRepo.findUniqueUserIncludeRole({
                username: body.username,
            })
            if (!user) {
                throw NotFoundException
            }


            const isPasswordMatch = await this.hashingService.compare(body.password, user.password_hash)
            if (!isPasswordMatch) {
                throw new HttpException('Invalid password', 400)
            }

            console.log('user', user, isPasswordMatch)

            // 4. Tạo mới accessToken và refreshToken
            const tokens = await this.generateTokens({
                userId: user.id,
                deviceId: 9999,
                // roleId: user.roleId || '1',
                // roleName: user.role.name || '1',
                roleId: 1,
                roleName: "1",
            })
            return tokens
        } catch (error) {
            console.error("error:", JSON.stringify(error))
            throw error
        }
    }

    async register(body: {
        [k: string]: string
    }) {
        try {
            // 1. Lấy thông tin user, kiểm tra user có tồn tại hay không, mật khẩu có đúng không
            const user = await this.authRepo.findUniqueUserIncludeRole({
                username: body.username,
            })
            if (user) {
                console.log('user already have')
                throw new HttpException('Already have username', 400)
            }

            const hashedPassword = await this.hashingService.hash(body.password);
            const registeredUser = this.authRepo.registerAccount({
                username: body.username,
                email: body.email,
                password_hash: hashedPassword,
            })

            return registeredUser
        } catch (error) {
            throw error
        }
    }



    async generateTokens({ userId, deviceId, roleId, roleName }: {
        userId: number,
        deviceId: number,
        roleId: number,
        roleName: string,
    }) {
        const [accessToken, refreshToken] = await Promise.all([
            this.tokenService.signAccessToken({
                userId,
                deviceId,
                roleId,
                roleName,
            }),
            this.tokenService.signRefreshToken({
                userId,
            }),
        ])
        return { accessToken, refreshToken }
    }

}