import "dotenv/config";
// Prisma 7 generates .ts; use extensionless path so tsx resolves to client.ts

import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });
export default prisma;
