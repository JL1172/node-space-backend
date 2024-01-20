import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { RegisterBody } from './dtos/register-dto';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';
import { User } from '@prisma/client';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly prisma: PrismaProvider) {}
  @Post('/register')
  async register(
    @Res({ passthrough: true }) res: Response,
    @Body() body: RegisterBody,
  ): Promise<void> {
    await this.prisma.createUser(body);
    res.status(201).json({ message: 'Successfully Created User Account' });
  }
  @Post('/login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() body: any,
  ): Promise<Record<string, any>> {
    return { ...body };
  }
  @Post('/logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Body() body: any,
  ): Promise<Record<string, any>> {
    return { ...body };
  }
  @Get('find')
  async findAll(): Promise<User[]> {
    return await this.prisma.findAll();
  }
  @Get('remove')
  async deleteAll(): Promise<void> {
    return await this.prisma.deleteAll();
  }
}
