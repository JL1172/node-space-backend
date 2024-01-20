import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { LogoutBody, PayloadBody } from 'src/auth-module/dtos/logout-dto';
import { RegisterBody } from 'src/auth-module/dtos/register-dto';

@Injectable()
export class PrismaProvider {
  private readonly prisma = new PrismaClient();
  constructor() {
    this.prisma = new PrismaClient();
  }
  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany();
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
  async findUser(userData: RegisterBody): Promise<any> {
    const username_found: User | null = await this.prisma.user.findUnique({
      where: { username: userData.username },
    });
    const email_found: User | null = await this.prisma.user.findUnique({
      where: { email: userData.email },
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
}
