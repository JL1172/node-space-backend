import { PrismaClient } from '@prisma/client';
import { CATEGORY_TYPE } from '@prisma/client';

const prisma = new PrismaClient();

export async function seed_categories() {
  try {
    const categories: {
      category_type: CATEGORY_TYPE;
      category_description: string;
    }[] = [
      {
        category_type: CATEGORY_TYPE.FRONTEND,
        category_description: 'Frontend',
      },
      {
        category_type: CATEGORY_TYPE.BACKEND,
        category_description: 'Backend',
      },
      {
        category_type: CATEGORY_TYPE.DATABASE,
        category_description: 'Database',
      },
      {
        category_type: CATEGORY_TYPE.NODESPACE,
        category_description: 'NodeSpace',
      },
    ];
    const subcategories: {
      sub_category_name: string;
      category_id: number;
    }[] = [
      {
        sub_category_name: 'HTML',
        category_id: 1,
      },
      {
        sub_category_name: 'CSS',
        category_id: 1,
      },
      {
        sub_category_name: 'JavaScript',
        category_id: 1,
      },
      {
        sub_category_name: 'React',
        category_id: 1,
      },
      {
        sub_category_name: 'Angular',
        category_id: 1,
      },
      {
        sub_category_name: 'Vue.js',
        category_id: 1,
      },
      {
        sub_category_name: 'Sass',
        category_id: 1,
      },
      {
        sub_category_name: 'Bootstrap',
        category_id: 1,
      },
      {
        sub_category_name: 'TypeScript',
        category_id: 1,
      },
      {
        sub_category_name: 'jQuery',
        category_id: 1,
      },
      {
        sub_category_name: 'Webpack',
        category_id: 1,
      },
      {
        sub_category_name: 'Babel',
        category_id: 1,
      },
      {
        sub_category_name: 'Ember.js',
        category_id: 1,
      },
      {
        sub_category_name: 'Backbone.js',
        category_id: 1,
      },
      {
        sub_category_name: 'Handlebars.js',
        category_id: 1,
      },
      {
        sub_category_name: 'Node.js',
        category_id: 2,
      },
      {
        sub_category_name: 'Express.js',
        category_id: 2,
      },
      {
        sub_category_name: 'Koa.js',
        category_id: 2,
      },
      {
        sub_category_name: 'NestJS',
        category_id: 2,
      },
      {
        sub_category_name: 'GraphQL',
        category_id: 2,
      },
      {
        sub_category_name: 'REST API',
        category_id: 2,
      },
      {
        sub_category_name: 'MySQL',
        category_id: 3,
      },
      {
        sub_category_name: 'PostgreSQL',
        category_id: 3,
      },
      {
        sub_category_name: 'MongoDB',
        category_id: 3,
      },
      {
        sub_category_name: 'SQLite',
        category_id: 3,
      },
      {
        sub_category_name: 'Firebase',
        category_id: 3,
      },
      {
        sub_category_name: 'DynamoDB',
        category_id: 3,
      },
      {
        sub_category_name: 'Couchbase',
        category_id: 3,
      },
      {
        sub_category_name: 'Redis',
        category_id: 3,
      },
    ];
    await prisma.$transaction([
      prisma.category.createMany({ data: categories }),
      prisma.subCategory.createMany({ data: subcategories }),
    ]);
    console.log('Data Seed Success');
  } catch (err) {
    console.error(`error seeding category fields: ${err}`);
  } finally {
    prisma.$disconnect;
    process.exit(1);
  }
}

async function reset_database() {
  try {
    await prisma.user.deleteMany();
    await prisma.ip_Watchlist.deleteMany();
    await prisma.ip_Blacklist.deleteMany();
    await prisma.subCategory.deleteMany();
    await prisma.category.deleteMany();
    await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Ip_Watchlist_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Ip_Blacklist_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "SubCategory_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Category_id_seq" RESTART WITH 1;`;
    console.log('Deleted Data Success');
  } catch (err) {
    console.log(err);
  }
}

async function main() {
  await reset_database();
  await seed_categories();
}
main();
