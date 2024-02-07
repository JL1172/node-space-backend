/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';
import {
  ReqStorageProvider,
  SanitizeFileNameProvider,
  ScanImageForMagicNumberProvider,
} from './services/providers/blog-provider';
import { IpAddressLookupProvider } from 'src/auth-module/services/providers/login-service';
import { BlogPayloadType, FinalBlogPayloadType } from './dtos/blog-dtos';
import { RestrictedPayloadService } from 'src/auth-module/services/providers/restricted-route-service';
import {
  SanitationInterceptor,
  ValidationInterceptor,
  VerifySubCategoriesInterceptor,
} from './services/interceptors/blog-interceptor';
import { MIME_TYPE } from '@prisma/client';

@Controller('api')
export class BlogController {
  constructor(
    private readonly prisma: PrismaProvider,
    private readonly sanitizeFilename: SanitizeFileNameProvider,
    private readonly scanImage: ScanImageForMagicNumberProvider,
    private readonly watchlistIp: IpAddressLookupProvider,
    private readonly reqStorage: ReqStorageProvider,
    private readonly payloadStorage: RestrictedPayloadService,
  ) {}
  @Get('/categories')
  async fetchBlogCategories() {
    const categories = await this.prisma.findCategories();
    return categories;
  }
  @Post('/create-blog')
  @UseInterceptors(
    FilesInterceptor('files'),
    ValidationInterceptor,
    SanitationInterceptor,
    VerifySubCategoriesInterceptor,
  )
  async uploadBlog(
    @Body() body: BlogPayloadType,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpg|jpeg)' }),
          new MaxFileSizeValidator({ maxSize: 500000 }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    try {
      const sanitizedFile = this.sanitizeFilename.sanitizeNames(files);
      for (const img of sanitizedFile) {
        await this.scanImage.scanImage(img);
      }
      const finalPayload = sanitizedFile.map((file) => {
        return {
          filename: file.originalname,
          size: file.size,
          mimeType:
            file.mimetype === 'png'
              ? MIME_TYPE.png
              : file.mimetype === 'jpg'
                ? MIME_TYPE.jpg
                : MIME_TYPE.jpeg,
          data: file.buffer,
        };
      });
      const bodyPayload: FinalBlogPayloadType = {
        blog_title: body.blog_title,
        blog_intro: body.blog_intro,
        blog_body: body.blog_body,
        blog_outro: body.blog_outro,
        blog_summary: body.blog_summary,
        user_id: this.payloadStorage.readPayload().id,
        blog_author_name: body.blog_author_name,
        category_id: Number(body.category_id),
      };
      const subCategoryPayload = body.sub_categories.map((n) => ({
        subcategory_id: n,
      }));
      await this.prisma.uploadBlogTotal(
        finalPayload,
        bodyPayload,
        subCategoryPayload,
      );
      return 'Successfully Created Blog.';
    } catch (err) {
      const req = this.reqStorage.readReq();
      await this.watchlistIp.watchlistIpAddress(req, 20);
      throw new HttpException(err.message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
  // @Get('/render-blog/media')
  // async fetchBlogMedia(
  //   @Query('id', ParseIntPipe) id: number,
  //   @Res({ passthrough: true }) res: Response,
  // ) {
  //   const result = await this.prisma.findBlogById(id, 'media');
  //   res.type('jpg');
  //   res.status(200).json(result['BlogMedia']);
  // }
  // @Get('/render-blog/content')
  // async fetchBlogContent(@Query('id', ParseIntPipe) id: number) {
  //   const result = await this.prisma.findBlogById(id, 'content');
  //   return result;
  // }
}
