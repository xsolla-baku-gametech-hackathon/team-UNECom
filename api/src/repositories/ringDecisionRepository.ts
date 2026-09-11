import { prisma } from "../db/prisma.js";

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

  async deleteAll(): Promise<number> {
    const { count } = await prisma.ringDecision.deleteMany();
    return count;
  },
};
