import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { RegisterBody } from './dtos/register-dto';

@Controller('api/auth')
export class AuthController {
  constructor() {}
  @Post('/register')
  async register(
    @Res({ passthrough: true }) res: Response,
    @Body() body: RegisterBody,
  ): Promise<Record<string, any>> {
    return { ...body };
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
}
