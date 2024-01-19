import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get('success')
  sanitySuccess(): string {
    return 'Sanity Success Message';
  }
  @Get('error')
  sanityError(): HttpException {
    throw new HttpException('Sanity Error', HttpStatus.BAD_REQUEST);
  }
}
