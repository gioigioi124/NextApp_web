import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("../packages/database/node_modules/@prisma/client");
const bcrypt = require("../apps/api/node_modules/bcrypt");

const email = process.env.ADMIN_EMAIL || "admin@example.com";
const plainPassword = process.env.ADMIN_PASSWORD || "Admin@123456";
const name = process.env.ADMIN_NAME || "Admin";

const prisma = new PrismaClient();

try {
  const password = await bcrypt.hash(plainPassword, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password,
      name,
      role: "ADMIN",
      emailVerified: true,
    },
    create: {
      email,
      password,
      name,
      role: "ADMIN",
      emailVerified: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
    },
  });

  console.log(JSON.stringify(user, null, 2));
} finally {
  await prisma.$disconnect();
}
