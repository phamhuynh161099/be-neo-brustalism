import {
    Controller,
    Get,
    Post,
    Body,
    HttpException,
    HttpStatus,
    Query,
    Sse,
    MessageEvent,
} from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { CmdService } from './cmd.service';
import { IsPublic } from 'src/shared/decorators/auth.decorator';
// import { ExecuteCommandDto, ExecutePlatformCommandDto } from './dto/execute-command.dto';

@Controller('cmd')
@IsPublic()
export class CmdController {
    constructor(private readonly cmdService: CmdService) { }

    @Get('system-info')
    getSystemInfo() {
        return this.cmdService.getSystemInfo();
    }

    @Post('execute')
    async executeCommand(@Body() dto: any) {
        if (!dto.command || dto.command.trim().length === 0) {
            throw new HttpException('Command is required', HttpStatus.BAD_REQUEST);
        }

        // Blacklist các command nguy hiểm
        const dangerousCommands = [
            'rm -rf',
            'del /f',
            'format',
            'shutdown',
            'reboot',
            'sudo rm',
            'dd if=',
        ];

        if (dangerousCommands.some(cmd => dto.command.toLowerCase().includes(cmd))) {
            throw new HttpException('Dangerous command detected', HttpStatus.FORBIDDEN);
        }

        return this.cmdService.executeCommand(dto.command, dto.timeout);
    }

    @Post('execute-platform')
    async executePlatformCommand(@Body() dto: any) {
        return this.cmdService.executePlatformCommand(
            dto.windowsCommand,
            dto.linuxCommand,
            dto.timeout,
        );
    }

    @Get('check-command')
    async checkCommandExists(@Query('command') command: string) {
        if (!command) {
            throw new HttpException('Command parameter is required', HttpStatus.BAD_REQUEST);
        }

        const exists = await this.cmdService.checkCommandExists(command);
        return {
            command,
            exists,
            platform: this.cmdService.getSystemInfo().platform,
        };
    }

    @Get('processes')
    async getProcessList() {
        return this.cmdService.getProcessList();
    }

    @Get('disk-usage')
    async getDiskUsage() {
        return this.cmdService.getDiskUsage();
    }

    @Get('memory-info')
    async getMemoryInfo() {
        return this.cmdService.getMemoryInfo();
    }

    @Get('network-info')
    async getNetworkInfo() {
        return this.cmdService.getNetworkInfo();
    }

    @Sse('execute-stream')
    executeCommandStream(@Query('command') command: string): Observable<MessageEvent> {
        const subject = new Subject<MessageEvent>();

        if (!command) {
            subject.error(new HttpException('Command parameter is required', HttpStatus.BAD_REQUEST));
            return subject.asObservable();
        }

        this.cmdService.executeCommandStream(
            command,
            [],
            (data) => {
                subject.next({
                    type: 'stdout',
                    data: JSON.stringify({ type: 'stdout', data }),
                });
            },
            (error) => {
                subject.next({
                    type: 'stderr',
                    data: JSON.stringify({ type: 'stderr', data: error }),
                });
            },
        ).then((result) => {
            subject.next({
                type: 'complete',
                data: JSON.stringify({ type: 'complete', result }),
            });
            subject.complete();
        }).catch((error) => {
            subject.error(error);
        });

        return subject.asObservable();
    }
}