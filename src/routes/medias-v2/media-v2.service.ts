import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const writeFile = promisify(fs.writeFile);

@Injectable()
export class MediasV2Service {
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

        /**
         * Tự xử lý, không dùng chức năng tự đông của multer
         */
        const savedFile = await this.saveFileToStorage(file);

        return {
            filename: savedFile.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: savedFile.fullPath,
            uploadDate: new Date(),
        };
    }

    async uploadMultipleFiles(files: Express.Multer.File[]) {
        const results: any[] = [];

        for (const file of files) {
            this.validateFile(file);

            // Tự xử lý việc lưu từng file
            const savedFile = await this.saveFileToStorage(file);

            results.push({
                filename: savedFile.filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                path: savedFile.fullPath,
                uploadDate: new Date(),
            });
        }

        return results;
    }

    private async saveFileToStorage(file: Express.Multer.File) {
        try {
            // Tạo tên file unique
            const fileExtension = this.getFileExtension(file.originalname);
            const uniqueFilename = `${uuidv4()}-${Date.now()}${fileExtension}`;

            const folderAccount = '/admin';
            const fullPath = path.join(this.uploadPath, folderAccount, uniqueFilename);

            /**
             ** Kiểm tra xe thư mục đã tồn tại chưa, nếu chưa thì khởi tạo
             */
            const targetDirectory = path.join(this.uploadPath, folderAccount);
            if (!fs.existsSync(targetDirectory)) {
                fs.mkdirSync(targetDirectory, { recursive: true });
            }
            

            // Kiểm tra và xử lý file theo loại
            let processedBuffer = file.buffer;

            if (file.mimetype.startsWith('image/')) {
                processedBuffer = await this.processImage(file.buffer, file.mimetype);
            } else if (this.isDocumentFile(file.mimetype)) {
                processedBuffer = await this.processDocument(file.buffer, file.mimetype);
            }

            // Lưu file vào disk
            await writeFile(fullPath, processedBuffer);

            console.log(`File saved: ${uniqueFilename} (${file.size} bytes)`);

            return {
                filename: uniqueFilename,
                fullPath: fullPath,
                relativePath: path.join('uploads', uniqueFilename),
            };
        } catch (error) {
            console.error('Error saving file:', error);
            throw new BadRequestException('Failed to save file');
        }
    }

    private async processImage(buffer: Buffer, mimetype: string): Promise<Buffer> {
        // Xử lý hình ảnh (có thể resize, compress, watermark, etc.)
        console.log(`Processing image: ${mimetype}`);

        // Ví dụ: Kiểm tra kích thước ảnh
        // Bạn có thể dùng sharp, jimp, canvas để xử lý

        // Giả lập xử lý ảnh
        await new Promise(resolve => setTimeout(resolve, 100));

        return buffer; // Trả về buffer đã xử lý
    }

    private async processDocument(buffer: Buffer, mimetype: string): Promise<Buffer> {
        // Xử lý document (scan virus, validate format, etc.)
        console.log(`Processing document: ${mimetype}`);

        // Giả lập xử lý document
        await new Promise(resolve => setTimeout(resolve, 50));

        return buffer; // Trả về buffer đã xử lý
    }

    private getFileExtension(filename: string): string {
        return path.extname(filename).toLowerCase();
    }

    private isDocumentFile(mimetype: string): boolean {
        const documentTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ];

        return documentTypes.includes(mimetype);
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