/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';

@Controller('api')
export class BlogController {
  constructor(private readonly prisma: PrismaProvider) {}
  @Get('/categories')
  async fetchBlogCategories(
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const categories = await this.prisma.findCategories();
    res.status(200).json({ categories });
  }
  @Post('/create-blog')
  async createBlog(@Res({ passthrough: true }) res: Response) {
    res.status(200).json({ message: 'create blog route' });
  }
}
