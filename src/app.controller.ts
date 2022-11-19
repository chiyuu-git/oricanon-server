/* eslint-disable unicorn/prefer-module */
import { Body, Controller, Get, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
// eslint-disable-next-line unicorn/import-style
import { extname, resolve } from 'path';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Post('/uploadList')
    // replace file to files to handle multi files
    @UseInterceptors(FilesInterceptor('files', 10, {
        storage: diskStorage({
            destination: resolve(__dirname, '../../public/assets'),
            filename: (req, file, cb) => {
                const ext = extname(file.originalname);
                // 这里的 name 也会改变文件的后缀, 而且文件的原名中文很难识别
                cb(null, `${randomUUID()}${ext}`);
            },

        }),
    }))
    uploadList(@UploadedFiles() files: Array<Express.Multer.File>) {
        // file path 需要返回资源地址, 而不是电脑的物理地址.
        // return {
        //     url: `http://172.18.188.40:3000/assets/${file.filename}`,
        //     ...file,
        // };
        const fileList = files.map((file) => ({
            src: `http://172.18.188.40:3000/assets/${file.filename}`,
            ...file,
        }));
        return fileList;
    }

    @Post('/upload')
    // replace file to files to handle multi files
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: resolve(__dirname, '../../public/assets'),
            filename: (req, file, cb) => {
                const ext = extname(file.originalname);
                // 这里的 name 也会改变文件的后缀, 而且文件的原名中文很难识别
                cb(null, `${(/[1-9]/g.exec(file.originalname))![0]}${ext}`);
            },

        }),
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        // file path 需要返回资源地址, 而不是电脑的物理地址.
        // return {
        //     url: `http://172.18.188.40:3000/assets/${file.filename}`,
        //     ...file,
        // };
        return `http://172.18.188.40:3000/assets/${file.filename}`;
    }
}
