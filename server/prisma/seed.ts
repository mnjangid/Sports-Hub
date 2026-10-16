import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Existing University dhundo (jo Studio se banayi thi)
  const university = await prisma.university.findFirst({
    where: { name: 'TEST University' },
  });

  if (!university) {
    throw new Error('TEST University nahi mili. Name check karo.');
  }

  const passwordHash = await bcrypt.hash('password', 10);

  await prisma.user.upsert({
    where: {
      universityId_email: {
        universityId: university.id,
        email: 'test@gmail.com',
      },
    },
    update: {},
    create: {
      universityId: university.id,
      fullName: 'Test Admin',
      email: 'test@gmail.com',
      passwordHash,
    },
  });

  console.log('User seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());