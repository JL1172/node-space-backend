/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
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
} from './services/interceptors/blog-interceptor';

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
  async fetchBlogCategories(
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const categories = await this.prisma.findCategories();
    res.status(200).json({ categories });
  }
  @Post('/create-blog')
  @UseInterceptors(
    FilesInterceptor('files'),
    ValidationInterceptor,
    SanitationInterceptor,
  )
  //! need to finished
  async uploadBlog(
    @Body() body: BlogPayloadType,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.(jpeg|jpg|png)',
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
    try {
      const sanitizedFile = this.sanitizeFilename.sanitizeNames(files);
      sanitizedFile.forEach((n) => this.scanImage.scanImage(n));
      const finalPayload = sanitizedFile.map((file) => {
        return {
          filename: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
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
        category_id: body.category_id,
      };
      const result = await this.prisma.uploadBlogTotal(
        finalPayload,
        bodyPayload,
        body['SubCategory'],
      );
      return files;
    } catch (err) {
      const req = this.reqStorage.readReq();
      await this.watchlistIp.watchlistIpAddress(req, 20);
      throw new HttpException(err.message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
  //! need to finished
}
