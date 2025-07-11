import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Ip, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { DatabaseNeoBrustalismService } from "src/shared/database/database-neo-brustalism.service";
import { CreateUserDto, PaginationOptions, UpdateUserDto, UserFilter } from "./user.dto";
import { UserAgent } from "src/shared/decorators/user-agent.decorator";

@Controller('user')
export class UserController {
    constructor(
        private userService: UserService,
        private databaseService: DatabaseNeoBrustalismService,
    ) { }

    @Get('test')
    test() {
        return 'test 123'
    }

    @Post()
    async create(@Body() userData: CreateUserDto) {
        return await this.userService.create(userData);
    }

    @Get()
    async findAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('sort_by') sort_by: string = 'created_at',
        @Query('sort_order') sort_order: 'ASC' | 'DESC' = 'DESC',
        @Query('is_active') is_active?: string | number,
        @Query('email') email?: string,
        @Query('username') username?: string,
        @Query('created_from') created_from?: string,
        @Query('created_to') created_to?: string,
    ) {
        const filter: UserFilter | any = {};
        if (is_active) filter.is_active = is_active;
        if (email) filter.email = email;
        if (username) filter.username = username;
        if (created_from) filter.created_from = new Date(created_from);
        if (created_to) filter.created_to = new Date(created_to);

        const pagination: PaginationOptions = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort_by,
            sort_order,
        };

        return await this.userService.findAll(filter, pagination);
    }

    @Get('stats')
    async getUserStats() {
        return await this.userService.getUserStats();
    }

    @Get('search')
    async searchUsers(
        @Query('keyword') keyword: string,
        @Query('limit') limit: string = '10',
    ) {
        return await this.userService.searchUsers(keyword, parseInt(limit));
    }

    @Get('health')
    async checkDatabaseHealth(@UserAgent() userAgent: string, @Ip() ip: string) {
        const defaultDbStatus = await this.databaseService.checkConnection('default');

        return {
            databases: {
                default: {
                    status: defaultDbStatus ? 'connected' : 'disconnected',
                    info: this.databaseService.getDatabaseInfo('default'),
                },
                userAgent,
                ip,
            },
        };
    }

    @Get(':id')
    async findById(@Param('id', ParseIntPipe) id: number) {
        return await this.userService.findById(id);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() userData: UpdateUserDto,
    ) {
        return await this.userService.update(id, userData);
    }


    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.userService.delete(id);
    }

    @Put(':id/change-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    async changePassword(
        @Param('id', ParseIntPipe) id: number,
        @Body() passwordData: { currentPassword: string; newPassword: string },
    ) {
        await this.userService.changePassword(
            id,
            passwordData.currentPassword,
            passwordData.newPassword,
        );
    }

    @Put('bulk/status')
    async bulkUpdateStatus(
        @Body() bulkData: { ids: number[]; status: 'active' | 'inactive' | 'blocked' },
    ) {
        const affectedRows = await this.userService.bulkUpdateStatus(
            bulkData.ids,
            bulkData.status,
        );
        return { message: `Updated ${affectedRows} users` };
    }

    @Post('validate')
    async validateUser(
        @Body() credentials: { email: string; password: string },
    ) {
        const user = await this.userService.validateUser(
            credentials.email,
            credentials.password,
        );

        if (!user) {
            return { valid: false, message: 'Invalid credentials' };
        }

        return { valid: true, user };
    }
}