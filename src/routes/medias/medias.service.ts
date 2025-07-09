// src/medias/medias.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

@Injectable()
export class MediasService {
    private readonly uploadPath = './uploads';

    constructor() {
        this.ensureUploadDirectory();
    }

    private ensureUploadDirectory() {
        if (!fs.existsSync(this.uploadPath)) {
            fs.mkdirSync(this.uploadPath, { recursive: true });
        }
    }

    async uploadSingleFile(file: Express.Multer.File) {
        this.validateFile(file);

        return {
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
            uploadDate: new Date(),
        };
    }

    async uploadMultipleFiles(files: Express.Multer.File[]) {
        const results: any[] = [];

        for (const file of files) {
            this.validateFile(file);
            results.push({
                filename: file.filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                path: file.path,
                uploadDate: new Date(),
            });
        }

        return results;
    }

    private validateFile(file: Express.Multer.File) {
        const allowedTypes = [
            // Images
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/bmp',
            'image/tiff',

            // Documents
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/rtf',

            // Excel
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv',

            // PowerPoint
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
        }

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new BadRequestException('File size exceeds 10MB limit');
        }
    }

    async downloadFile(filename: string, res: Response) {
        const filePath = path.join(this.uploadPath, filename);

        if (!fs.existsSync(filePath)) {
            throw new NotFoundException('File not found');
        }

        res.download(filePath, filename);
    }

    async viewFile(filename: string, res: Response) {
        const filePath = path.join(this.uploadPath, filename);

        if (!fs.existsSync(filePath)) {
            throw new NotFoundException('File not found');
        }

        const stats = await stat(filePath);
        const mimeType = this.getMimeType(filename);

        res.set({
            'Content-Type': mimeType,
            'Content-Length': stats.size,
        });

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    }

    async deleteFile(filename: string) {
        const filePath = path.join(this.uploadPath, filename);

        if (!fs.existsSync(filePath)) {
            throw new NotFoundException('File not found');
        }

        await unlink(filePath);
    }

    async listFiles() {
        const files = await readdir(this.uploadPath);
        const fileDetails: any[] = [];

        for (const filename of files) {
            const filePath = path.join(this.uploadPath, filename);
            const stats = await stat(filePath);

            fileDetails.push({
                filename,
                size: stats.size,
                uploadDate: stats.birthtime,
                mimetype: this.getMimeType(filename),
            });
        }

        return fileDetails;
    }

    private getMimeType(filename: string): string {
        const ext = path.extname(filename).toLowerCase();

        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.bmp': 'image/bmp',
            '.tiff': 'image/tiff',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.txt': 'text/plain',
            '.rtf': 'application/rtf',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.csv': 'text/csv',
            '.ppt': 'application/vnd.ms-powerpoint',
            '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        };

        return mimeTypes[ext] || 'application/octet-stream';
    }
}