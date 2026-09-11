import { Prisma, PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

/** Either the shared client or the client handed to a $transaction callback. */
export type DbClient = PrismaClient | Prisma.TransactionClient;
