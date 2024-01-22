import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { RegisterBody } from './dtos/register-dto';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';
import { User } from '@prisma/client';
import { UserJwtStorage } from './services/providers/login-service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaProvider,
    private readonly userService: UserJwtStorage,
  ) {}
  @Post('/register')
  async register(
    @Res({ passthrough: true }) res: Response,
    @Body() body: RegisterBody,
  ): Promise<void> {
    await this.prisma.createUser(body);
    res
      .status(201)
      .json({ message: 'Successfully Created User Account' })
      .redirect('/creator/login');
  }
  @Post('/login')
  async login(@Res({ passthrough: true }) res: Response): Promise<void> {
    const token: string = await this.userService.buildJwt();
    res.status(200).json({ token: token }).redirect('/creator/blog-form');
  }
  @Post('/logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<void> {
    res.status(200);
  }
  @Get('find')
  async findAll(): Promise<User[]> {
    return await this.prisma.findAll();
  }
}
