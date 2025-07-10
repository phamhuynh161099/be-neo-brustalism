import { Body, Controller, Ip, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { IsPublic } from "src/shared/decorators/auth.decorator";
import { UserAgent } from "src/shared/decorators/user-agent.decorator";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }


    @Post('login')
    @IsPublic()
    login(@Body() body, @UserAgent() userAgent: string, @Ip() ip: string) {
        return this.authService.login({
            ...body,
            userAgent,
            ip,
        })
    }

    @Post('register')
    @IsPublic()
    register(@Body() body) {
        return this.authService.register({
            ...body,
        })
    }
}
