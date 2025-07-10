import { ApiProperty } from "@nestjs/swagger"

export class LoginDto {
    @ApiProperty({
        description: 'Username to login',
        example: 'sakata1301'
    })
    username: string

    @ApiProperty({
        description: 'Password to login',
    })
    password: string
}