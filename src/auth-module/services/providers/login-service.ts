import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';
import * as bcrypt from 'bcrypt';
import { JwtProvider } from 'src/global-utils/global-services/providers/JwtProvider';
import { User } from '@prisma/client';
import * as os from 'node:os';
import { Request } from 'express';

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

@Injectable()
export class IpAddressLookupProvider {
  private readonly os = os;
  constructor(private readonly prisma: PrismaProvider) {
    this.os = os;
  }
  async watchlistIpAddress(req: any, limit: number) {
    try {
      if (process.env.STATUS === 'dev') {
        const ipAddress = this.os.networkInterfaces().wlp48s0[0]?.address;
        const payload = {
          ip_address: ipAddress,
          created_at: new Date(),
        };
        const result = await this.prisma.handleIpAddresses(payload, limit);
        return result;
        // if (result) {
        //   return true;
        //   throw new HttpException(
        //     'Too Many Requests, Suspicious Amount Of Attempts.',
        //     HttpStatus.FORBIDDEN,
        //   );
        // }
      } else {
        const ipAddress = req.socket.remoteAddress;
        const modded_ip = ipAddress.split(' ')[0].replaceAll(',', '');
        const payload = {
          ip_address: modded_ip,
          created_at: new Date(),
        };
        const result = await this.prisma.handleIpAddresses(payload, limit);
        return result;
        // if (result) {
        //   throw new HttpException(
        //     'Too Many Requests, Suspicious Amount Of Attempts.',
        //     HttpStatus.FORBIDDEN,
        //   );
        // } else {
        //   return false;
        // }
      }
    } catch (err) {
      throw new HttpException(err, HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
@Injectable()
export class PasswordComparison {
  private readonly bcrypt = bcrypt;
  private hashedPassword = '';
  constructor(private readonly ipAddressProvider: IpAddressLookupProvider) {
    this.bcrypt = bcrypt;
    this.hashedPassword = '';
  }
  async storePassword(password: string): Promise<void> {
    this.hashedPassword = password;
  }
  async comparePassword(
    password: string,
    req: Request,
  ): Promise<boolean | void> {
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
      await this.ipAddressProvider.watchlistIpAddress(req, 20);
      throw new HttpException(err, HttpStatus.UNAUTHORIZED);
    }
  }
}
