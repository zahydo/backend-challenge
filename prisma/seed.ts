import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 10; i++) {
    const randomActivity = Math.floor(Math.random() * 10) + 1;
    await prisma.user.upsert({
      where: { email: `email${i}@gmail.com` },
      update: {
        name: `name${i}`,
      },
      create: {
        email: `email${i}@gmail.com`,
        name: `name${i}`,
        activities: {
          createMany: {
            skipDuplicates: true,
            data: Array.from({ length: randomActivity }).map((_, index) => ({
              details: `details${i}`,
              title: `title${i}`,
              timestamp: new Date(),
              type: index % 2 === 0 ? 'LOGIN' : 'PDF_DOWNLOAD',
            })),
          },
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
