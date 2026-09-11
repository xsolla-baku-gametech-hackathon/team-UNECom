import { prisma, type DbClient } from "../db/prisma.js";

export const ringDecisionRepository = {
  async findAll() {
    return prisma.ringDecision.findMany();
  },

  async upsert(ringId: string, status: "confirmed_real" | "confirmed_fraud") {
    return prisma.ringDecision.upsert({
      where: { ringId },
      create: { ringId, status },
      update: { status },
    });
  },

  // `db` lets a caller run this inside prisma.$transaction alongside the
  // other tables' deleteAll.
  async deleteAll(db: DbClient = prisma): Promise<number> {
    const { count } = await db.ringDecision.deleteMany();
    return count;
  },
};
