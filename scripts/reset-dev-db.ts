import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reset_database() {
  try {
    await prisma.user.deleteMany();
    await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`;
    console.log('Deleted Data Success');
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

reset_database();
