import { Injectable, Logger } from '@nestjs/common';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';

const execAsync = promisify(exec);

export interface CommandResult {
    success: boolean;
    stdout: string;
    stderr: string;
    code?: number;
    platform: string;
}

export interface SystemInfo {
    platform: string;
    isWindows: boolean;
    isLinux: boolean;
    arch: string;
    version: string;
    hostname: string;
    uptime: number;
}

@Injectable()
export class CmdService {
    private readonly logger = new Logger(CmdService.name);

    /**
     * Xác định môi trường hệ điều hành
     */
    getSystemInfo(): SystemInfo {
        const platform = os.platform();
        return {
            platform,
            isWindows: platform === 'win32',
            isLinux: platform === 'linux',
            arch: os.arch(),
            version: os.release(),
            hostname: os.hostname(),
            uptime: os.uptime(),
        };
    }

    /**
     * Thực thi command đơn giản
     */
    async executeCommand(command: string, timeout = 30000): Promise<CommandResult> {
        try {
            this.logger.log(`Executing command: ${command}`);

            const { stdout, stderr } = await execAsync(command, {
                timeout,
                encoding: 'utf8',
            });

            return {
                success: true,
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                platform: os.platform(),
            };
        } catch (error) {
            this.logger.error(`Command execution failed: ${error.message}`);

            return {
                success: false,
                stdout: error.stdout || '',
                stderr: error.stderr || error.message,
                code: error.code,
                platform: os.platform(),
            };
        }
    }

    /**
     * Thực thi command với streaming output
     */
    async executeCommandStream(
        command: string,
        args: string[] = [],
        onData?: (data: string) => void,
        onError?: (data: string) => void,
    ): Promise<CommandResult> {
        return new Promise((resolve) => {
            let stdout = '';
            let stderr = '';

            const systemInfo = this.getSystemInfo();
            const shell = systemInfo.isWindows ? 'cmd' : 'bash';
            const shellArgs = systemInfo.isWindows ? ['/c', command, ...args] : ['-c', `${command} ${args.join(' ')}`];

            const child = spawn(shell, shellArgs, {
                stdio: ['pipe', 'pipe', 'pipe'],
            });

            child.stdout.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                if (onData) onData(output);
            });

            child.stderr.on('data', (data) => {
                const error = data.toString();
                stderr += error;
                if (onError) onError(error);
            });

            child.on('close', (code: any) => {
                resolve({
                    success: code === 0,
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                    code,
                    platform: os.platform(),
                });
            });

            child.on('error', (error) => {
                resolve({
                    success: false,
                    stdout: stdout.trim(),
                    stderr: error.message,
                    platform: os.platform(),
                });
            });
        });
    }

    /**
     * Thực thi command theo platform
     */
    async executePlatformCommand(
        windowsCommand: string,
        linuxCommand: string,
        timeout = 30000,
    ): Promise<CommandResult> {
        const systemInfo = this.getSystemInfo();
        const command = systemInfo.isWindows ? windowsCommand : linuxCommand;

        return this.executeCommand(command, timeout);
    }

    /**
     * Kiểm tra xem command có tồn tại không
     */
    async checkCommandExists(command: string): Promise<boolean> {
        try {
            const systemInfo = this.getSystemInfo();
            const checkCommand = systemInfo.isWindows
                ? `where ${command}`
                : `which ${command}`;

            const result = await this.executeCommand(checkCommand);
            return result.success && result.stdout.length > 0;
        } catch {
            return false;
        }
    }

    /**
     * Lấy danh sách processes
     */
    async getProcessList(): Promise<CommandResult> {
        return this.executePlatformCommand(
            'tasklist /fo csv',
            'ps aux',
        );
    }

    /**
     * Kiểm tra disk usage
     */
    async getDiskUsage(): Promise<CommandResult> {
        return this.executePlatformCommand(
            'wmic logicaldisk get size,freespace,caption',
            'df -h',
        );
    }

    /**
     * Lấy thông tin memory
     */
    async getMemoryInfo(): Promise<CommandResult> {
        return this.executePlatformCommand(
            'wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value',
            'free -h',
        );
    }

    /**
     * Lấy thông tin network
     */
    async getNetworkInfo(): Promise<CommandResult> {
        return this.executePlatformCommand(
            'ipconfig /all',
            'ifconfig -a',
        );
    }
}