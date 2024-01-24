import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
@Injectable()
export class PasswordService {
  private readonly bcrypt = bcrypt;
  constructor() {
    this.bcrypt = bcrypt;
  }
  async hashPassword(password: string): Promise<string> {
    try {
      const hashedPassword: string = await this.bcrypt.hash(
        password,
        Number(process.env.BCRYPT_ROUNDS),
      );
      return hashedPassword;
    } catch (err) {
      throw new HttpException(
        `Error Processing Password: ${err}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
