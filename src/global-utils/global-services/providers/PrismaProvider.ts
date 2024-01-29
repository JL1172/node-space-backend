import { Injectable } from '@nestjs/common';
import { Ip_Blacklist, Ip_Watchlist, PrismaClient, User } from '@prisma/client';
import { LogoutBody, PayloadBody } from 'src/auth-module/dtos/logout-dto';
import { RegisterBody } from 'src/auth-module/dtos/register-dto';

@Injectable()
export class PrismaProvider {
  private readonly prisma = new PrismaClient();
  constructor() {
    this.prisma = new PrismaClient();
  }
  async cronJobJwtFnOne(): Promise<number> {
    return await this.prisma.token_Blacklist.count();
  }
  async cronJobJwtFnTwo(): Promise<number> {
    await this.prisma.token_Blacklist.deleteMany({
      where: {
        expiration_time: { lt: new Date() },
      },
    });
    return await this.prisma.token_Blacklist.count();
  }
  async findUser(username: string, email: string): Promise<any> {
    const username_found: User | null = await this.prisma.user.findUnique({
      where: { username: username },
    });
    const email_found: User | null = await this.prisma.user.findUnique({
      where: { email: email },
    });
    const isUsernameUnique: boolean = username_found ? false : true;
    const isEmailUnique: boolean = email_found ? false : true;
    return [isUsernameUnique, isEmailUnique];
  }
  async createUser(userData: RegisterBody): Promise<void> {
    await this.prisma.user.create({ data: userData });
  }
  async findUserForLogin(username: string): Promise<User | null> {
    const result: User | null = await this.prisma.user.findUnique({
      where: { username: username },
    });
    return result;
  }
  async findJwt(token: LogoutBody['token']) {
    return await this.prisma.token_Blacklist.findUnique({
      where: { jwt: token },
    });
  }
  async blackListJwt(payload: PayloadBody) {
    await this.prisma.token_Blacklist.create({ data: payload });
  }
  async findBlacklistedAddress(payload: Ip_Blacklist['ip_address']) {
    const result = await this.prisma.ip_Blacklist.findUnique({
      where: { ip_address: payload },
    });
    return result;
  }
  async handleIpAddresses(payload: {
    ip_address: string;
    created_at: Date;
  }): Promise<void | boolean> {
    //grabbing list of ipaddresses
    const ipAddressList: Ip_Watchlist[] =
      await this.prisma.ip_Watchlist.findMany({
        where: { ip_address: payload.ip_address },
      });
    //conditional if there are ipaddresses
    if (ipAddressList) {
      if (ipAddressList.length >= 20) {
        //initializing array with only ms values
        const dates: number[] = ipAddressList.map((n) => {
          if (n.created_at) {
            return n.created_at.setMilliseconds(1000);
          }
        });
        //establishing ranges with lower: hour ago, upper: now in milliseconds
        const upper_range: number = Date.now();
        const lower_range: number = upper_range - 1000 * 60 * 60;
        //this returns a boolean true is the argument date in ranges
        function checkRange(date: number) {
          return date >= lower_range && date <= upper_range;
        }
        //initializing result boolean variable
        let result = true;
        for (const date of dates) {
          result = checkRange(date);
          if (!result) {
            break;
          }
        }
        if (result) {
          const isAlreadyBlacklisted =
            await this.prisma.ip_Blacklist.findUnique({
              where: { ip_address: payload.ip_address },
            });
          if (isAlreadyBlacklisted) {
            return true;
          } else {
            await this.prisma.ip_Blacklist.create({ data: payload });
            return true;
          }
        } else {
          await this.prisma.ip_Watchlist.create({ data: payload });
          return false;
        }
      } else {
        await this.prisma.ip_Watchlist.create({ data: payload });
        return false;
      }
    } else {
      await this.prisma.ip_Watchlist.create({ data: payload });
      return false;
    }
  }
}

/*
i have a question. so on my rate limiter for logging in, I have it pretty strict where every 5 requests the rate limiter puts it all on pause for the remainder of the time. during that, i want to add the ip_address to a watch list, i know this isnt a full proof way, but it does the job, any way, i want add the ipddress to a table and its entry is just new Date() and the ip address. if it shows up more than 4 times in an hour, i want to blacklist the ipaddress and dissallow it from making requests, how do i do tha*/
