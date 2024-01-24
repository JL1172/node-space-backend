import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { JwtProvider } from 'src/global-utils/global-services/providers/JwtProvider';
@Controller('api/verification')
export class AuthorizationController {
  constructor(private readonly jwt: JwtProvider) {}
  @Get('/restricted-check')
  verifyJwt(@Res({ passthrough: true }) res: Response): void {
    res.status(200).json({ authentication: true });
  }
}
