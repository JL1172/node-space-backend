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
        sub_category_name: 'Authentication',
        category_id: 2,
      },
      {
        sub_category_name: 'Authorization',
        category_id: 2,
      },
      {
        sub_category_name: 'Error Handling',
        category_id: 2,
      },
      {
        sub_category_name: 'Logging',
        category_id: 2,
      },
      {
        sub_category_name: 'Caching',
        category_id: 2,
      },
      {
        sub_category_name: 'Middleware',
        category_id: 2,
      },
      {
        sub_category_name: 'Routing',
        category_id: 2,
      },
      {
        sub_category_name: 'ORM (Object-Relational Mapping)',
        category_id: 2,
      },
      {
        sub_category_name: 'Testing',
        category_id: 2,
      },
      {
        sub_category_name: 'Security',
        category_id: 2,
      },
      {
        sub_category_name: 'Validation',
        category_id: 2,
      },
      {
        sub_category_name: 'Background Jobs',
        category_id: 2,
      },
      {
        sub_category_name: 'Rate Limiting',
        category_id: 2,
      },
      {
        sub_category_name: 'WebSockets',
        category_id: 2,
      },
      {
        sub_category_name: 'GraphQL',
        category_id: 2,
      },
      {
        sub_category_name: 'SQL (Structured Query Language)',
        category_id: 3,
      },
      {
        sub_category_name: 'Indexing',
        category_id: 3,
      },
      {
        sub_category_name: 'Transactions',
        category_id: 3,
      },
      {
        sub_category_name: 'ACID Compliance',
        category_id: 3,
      },
      {
        sub_category_name: 'NoSQL (Not Only SQL)',
        category_id: 3,
      },
      {
        sub_category_name: 'Sharding',
        category_id: 3,
      },
      {
        sub_category_name: 'Replication',
        category_id: 3,
      },
      {
        sub_category_name: 'Backups',
        category_id: 3,
      },
      {
        sub_category_name: 'Triggers',
        category_id: 3,
      },
      {
        sub_category_name: 'Stored Procedures',
        category_id: 3,
      },
      {
        sub_category_name: 'Views',
        category_id: 3,
      },
      {
        sub_category_name: 'Full-Text Search',
        category_id: 3,
      },
      {
        sub_category_name: 'Geospatial Data',
        category_id: 3,
      },
      {
        sub_category_name: 'Data Modeling',
        category_id: 3,
      },
      {
        sub_category_name: 'Database Administration',
        category_id: 3,
      },
      {
        sub_category_name: 'Child Process',
        category_id: 4,
      },
      {
        sub_category_name: 'Cluster',
        category_id: 4,
      },
      {
        sub_category_name: 'Crypto',
        category_id: 4,
      },
      {
        sub_category_name: 'DNS',
        category_id: 4,
      },
      {
        sub_category_name: 'Events',
        category_id: 4,
      },
      {
        sub_category_name: 'File System',
        category_id: 4,
      },
      {
        sub_category_name: 'HTTP',
        category_id: 4,
      },
      {
        sub_category_name: 'HTTPS',
        category_id: 4,
      },
      {
        sub_category_name: 'Net',
        category_id: 4,
      },
      {
        sub_category_name: 'OS',
        category_id: 4,
      },
      {
        sub_category_name: 'Path',
        category_id: 4,
      },
      {
        sub_category_name: 'Process',
        category_id: 4,
      },
      {
        sub_category_name: 'Query String',
        category_id: 4,
      },
      {
        sub_category_name: 'Stream',
        category_id: 4,
      },
      {
        sub_category_name: 'Timers',
        category_id: 4,
      },
      {
        sub_category_name: 'URL',
        category_id: 4,
      },
      {
        sub_category_name: 'Utilities',
        category_id: 4,
      },
      {
        sub_category_name: 'V8',
        category_id: 4,
      },
      {
        sub_category_name: 'Zlib',
        category_id: 4,
      },
      {
        sub_category_name: 'Readline',
        category_id: 4,
      },
      {
        sub_category_name: 'REPL',
        category_id: 4,
      },
      {
        sub_category_name: 'TTY',
        category_id: 4,
      },
      {
        sub_category_name: 'HTTP/2',
        category_id: 4,
      },
      {
        sub_category_name: 'Buffer',
        category_id: 4,
      },
      {
        sub_category_name: 'Cryptography',
        category_id: 4,
      },
      {
        sub_category_name: 'Domains',
        category_id: 4,
      },
      {
        sub_category_name: 'Module',
        category_id: 4,
      },
      {
        sub_category_name: 'Performance',
        category_id: 4,
      },
      {
        sub_category_name: 'Punycode',
        category_id: 4,
      },
      {
        sub_category_name: 'String Decoder',
        category_id: 4,
      },
      {
        sub_category_name: 'TLS/SSL',
        category_id: 4,
      },
      {
        sub_category_name: 'UDP/Datagram',
        category_id: 4,
      },
      {
        sub_category_name: 'VM',
        category_id: 4,
      },
      {
        sub_category_name: 'Worker Threads',
        category_id: 4,
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
