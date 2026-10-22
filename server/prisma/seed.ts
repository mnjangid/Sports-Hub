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

  const roleNames = ["STUDENT", "COORDINATOR", "ADMIN"];

for (const name of roleNames) {
  await prisma.role.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

console.log("Roles seeded");

 await prisma.user.upsert({
  where: {
    email: 'test@gmail.com',
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