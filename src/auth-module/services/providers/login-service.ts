import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';
import * as bcrypt from 'bcrypt';
import { JwtProvider } from 'src/global-utils/global-services/providers/JwtProvider';
import { User } from '@prisma/client';

@Injectable()
export class PasswordComparison {
  private readonly bcrypt = bcrypt;
  private hashedPassword = '';
  constructor(private readonly prisma: PrismaProvider) {
    this.bcrypt = bcrypt;
    this.hashedPassword = '';
  }
  async storePassword(password: string): Promise<void> {
    this.hashedPassword = password;
  }
  async comparePassword(password: string): Promise<boolean | void> {
    try {
      const result: boolean = await this.bcrypt.compare(
        password,
        this.hashedPassword,
      );
      if (result) {
        return true;
      } else {
        throw new HttpException(
          'Invalid Username or Password',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch (err) {
      throw new HttpException(err, HttpStatus.UNAUTHORIZED);
    }
  }
}

@Injectable()
export class UserJwtStorage {
  private user: User | undefined = undefined;
  constructor(private readonly jwtProvider: JwtProvider) {
    this.user = undefined;
  }
  storeUser(user: User) {
    this.user = user;
  }
  async buildJwt() {
    return await this.jwtProvider.jwtBuilder(this.user);
  }
}
