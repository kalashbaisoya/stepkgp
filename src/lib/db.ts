import { PrismaClient } from "@prisma/client";

// Prisma client singleton — ensures fresh models are loaded
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export const prisma = db;
export default db;
