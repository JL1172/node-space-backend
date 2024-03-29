import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ROLE } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { LogoutBody } from 'src/auth-module/dtos/logout-dto';
import { DecodedTokenStorageService } from './DecodedTokenStorage';
@Injectable()
export class JwtProvider {
  private readonly jwt = jwt;
  constructor(
    private readonly decodedTokenStorage: DecodedTokenStorageService,
  ) {
    this.jwt = jwt;
  }
  async jwtBuilder(userData: {
    id: number;
    role: ROLE;
    username: string;
    email: string;
  }) {
    try {
      const { id, role, username, email } = userData;
      const payload: {
        id: number;
        subject: ROLE;
        username: string;
        email: string;
      } = {
        id: id,
        subject: role,
        username: username,
        email: email,
      };
      const options: { expiresIn: string } = {
        expiresIn: '1d',
      };
      return this.jwt.sign(payload, process.env.JWT_SECRET, options);
    } catch (err) {
      throw new HttpException(
        `Error Signing Token: ${err}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async jwtVerification(token: LogoutBody['token']) {
    try {
      this.jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          throw new HttpException(
            `Invalid Token: ${err}`,
            HttpStatus.UNAUTHORIZED,
          );
        } else {
          this.decodedTokenStorage.storeDecodedToken(decodedToken);
        }
      });
    } catch (err) {
      throw new HttpException(
        `Error Processing Token: ${err}`,
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
