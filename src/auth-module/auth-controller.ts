import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { RegisterBody } from './dtos/register-dto';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';
import { UserJwtStorage } from './services/providers/login-service';
import { RestrictedPayloadStorageType } from './dtos/restricted-route.dto';
import { RestrictedPayloadService } from './services/providers/restricted-route-service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaProvider,
    private readonly userService: UserJwtStorage,
    private readonly payloadStorage: RestrictedPayloadService,
  ) {}
  @Post('/register')
  async register(
    @Res({ passthrough: true }) res: Response,
    @Body() body: RegisterBody,
  ): Promise<void> {
    await this.prisma.createUser(body);
    res.status(201).json({ message: 'Successfully Created User Account' });
  }
  @Post('/login')
  async login(@Res({ passthrough: true }) res: Response): Promise<void> {
    // const token: string = await this.userService.buildJwt();
    // res.status(200).json({ token: token });
    res.status(200);
  }
  @Get('/logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<void> {
    res.status(200);
  }
  @Get('/restricted-check')
  verifyJwt(): any {
    const payload: RestrictedPayloadStorageType =
      this.payloadStorage.readPayload();
    return { authorized: true, payload };
  }
}
