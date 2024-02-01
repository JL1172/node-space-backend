/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';
import sanitize = require('sanitize-filename');

@Controller('api')
export class BlogController {
  private readonly sanitize = sanitize;
  constructor(private readonly prisma: PrismaProvider) {
    this.sanitize = sanitize;
  }
  @Get('/categories')
  async fetchBlogCategories(
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const categories = await this.prisma.findCategories();
    res.status(200).json({ categories });
  }
  @Post('/create-blog')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadBlog(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.(jpg|jpeg|png)',
        })
        .addMaxSizeValidator({
          maxSize: 1000000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Array<Express.Multer.File>,
  ) {
    const sanitizedFile = files.map((file) => {
      const sanitizedFileName = this.sanitize(file.originalname);
      return { ...file, originalname: sanitizedFileName };
    });
    const magicNumPng = '89504E470D0A1A0A';
    const magicNumJpqJpeg = 'FFD8FFE0';
    function scanImage(img: Express.Multer.File) {
      const buffer = img.buffer.subarray(0, 8).toString('hex').toUpperCase();
      if (magicNumPng === buffer) {
        return true;
      } else {
        if (magicNumJpqJpeg === buffer.slice(0, 8)) {
          return true;
        } else {
          return false;
        }
      }
    }
    sanitizedFile.forEach((file) => {
      if (!scanImage(file)) {
        throw new HttpException(
          `Invalid File Type, Must Be PNG, JPG, JPEG, file name: ${file.originalname}`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    });
    return sanitizedFile;
  }
}
