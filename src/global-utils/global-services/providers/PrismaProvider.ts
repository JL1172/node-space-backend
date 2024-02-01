import { Injectable } from '@nestjs/common';
import { Ip_Blacklist, PrismaClient, User } from '@prisma/client';
import { LogoutBody, PayloadBody } from 'src/auth-module/dtos/logout-dto';
import { RegisterBody } from 'src/auth-module/dtos/register-dto';
import {
  BlogPayloadType,
  FinalBlogPayloadType,
} from 'src/blog-module/dtos/blog-dtos';

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
  async clearIpEntries() {
    await this.prisma.ip_Watchlist.deleteMany({
      where: { created_at: { lt: new Date(Date.now() - 1000 * 60 * 60 * 24) } },
    });
  }
  async clearBlackListEntries() {
    await this.prisma.ip_Blacklist.deleteMany({
      where: { created_at: { lt: new Date(Date.now() - 1000 * 604800) } },
    });
  }
  async findCategories(): Promise<Record<any, any>[]> {
    return await this.prisma.category.findMany({
      select: {
        category_type: true,
        category_description: true,
        SubCategory: true,
      },
    });
  }
  //! need to work on this and iron it out
  //blog => BlogToSub => BlogMedia
  async uploadBlogTotal(
    files: { filename: string; size: number; mimeType: string; data: Buffer }[],
    blogFormData: FinalBlogPayloadType,
    subCategories: BlogPayloadType['SubCategory'],
  ) {
    const blogData = {
      ...blogFormData,
      category_id: Number(blogFormData.category_id),
    };
    // const { id } = await this.prisma.blog.create({ data: blogData });
    const id = 1;
    const fileData = files.map((n) => ({ ...n, blog_id: id }));
    // const results = await this.prisma.blog.create({ data: fileData });

    return files;
  }
  //! need to work on this and iron it out
  async findBlacklistedAddress(payload: Ip_Blacklist['ip_address']) {
    const result = await this.prisma.ip_Blacklist.findUnique({
      where: { ip_address: payload },
    });
    return result;
  }
  async handleIpAddresses(
    payload: {
      ip_address: string;
      created_at: Date;
    },
    limit: number,
  ): Promise<void | boolean> {
    //grabbing list of ipaddresses
    const ipAddressList = await this.prisma.ip_Watchlist.findMany({
      where: { ip_address: payload.ip_address },
    });
    //conditional if there are ipaddresses
    if (ipAddressList.length >= limit) {
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
      let counter = 0;
      for (const date of dates) {
        if (checkRange(date)) counter += 1;
      }
      if (counter >= limit) {
        const isAlreadyBlacklisted = await this.prisma.ip_Blacklist.findUnique({
          where: { ip_address: payload.ip_address },
        });
        if (!isAlreadyBlacklisted) {
          await this.prisma.ip_Blacklist.create({ data: payload });
          return true;
        } else return true;
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

/*ddress list from prisma provider [
  {
    id: 1,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T21:38:42.934Z
  },
  {
    id: 2,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T21:39:16.733Z
  },
  {
    id: 3,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:47:25.898Z
  },
  {
    id: 4,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:47:43.940Z
  },
  {
    id: 5,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:47:54.369Z
  },
  {
    id: 6,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:47:54.930Z
  },
  {
    id: 7,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:47:55.533Z
  },
  {
    id: 8,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:47:56.130Z
  },
  {
    id: 9,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:48:33.926Z
  },
  {
    id: 10,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:48:34.560Z
  },
  {
    id: 11,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:48:38.831Z
  },
  {
    id: 12,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:48:39.443Z
  },
  {
    id: 13,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:48:40.057Z
  },
  {
    id: 14,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:48:43.585Z
  },
  {
    id: 15,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:48:44.260Z
  },
  {
    id: 16,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:48:44.983Z
  },
  {
    id: 17,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:48:49.643Z
  },
  {
    id: 18,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:48:50.257Z
  },
  {
    id: 19,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:48:51.001Z
  },
  {
    id: 20,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:48:54.897Z
  },
  {
    id: 21,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:48:55.494Z
  },
  {
    id: 22,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:48:56.122Z
  },
  {
    id: 23,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:50:03.823Z
  },
  {
    id: 24,
    ip_address: '192.168.0.159',
    created_at: 2024-01-29T23:59:24.159Z
  }
]


address list is truthy entry
address list is greater than two
dates modified: [
  1706564323000, 1706564357000,
  1706572046000, 1706572064000,
  1706572075000, 1706572075000,
  1706572076000, 1706572077000,
  1706572114000, 1706572115000,
  1706572119000, 1706572120000,
  1706572121000, 1706572124000,
  1706572125000, 1706572125000,
  1706572130000, 1706572131000,
  1706572132000, 1706572135000,
  1706572136000, 1706572137000,
  1706572204000, 1706572765000
]
result false
returning false from 1
Trace: 
    at PrismaProvider.handleIpAddresses (/home/jacoblang11/0-personal-work/full-stack/personal-projects/node-space/node-space-backend/src/global-utils/global-services/providers/PrismaProvider.ts:122:19)
    at IpAddressLookupProvider.watchlistIpAddress (/home/jacoblang11/0-personal-work/full-stack/personal-projects/node-space/node-space-backend/src/auth-module/services/providers/login-service.ts:67:24)
    at Object.handler (/home/jacoblang11/0-personal-work/full-stack/personal-projects/node-space/node-space-backend/src/auth-module/services/middleware/login-mw.ts:61:11)

*/
