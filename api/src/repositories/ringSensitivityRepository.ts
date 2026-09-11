import { prisma } from "../db/prisma.js";

export const ringSensitivityRepository = {
  async findAll() {
    return prisma.ringSensitivity.findMany();
  },

  async upsert(ringId: string, sensitivity: number) {
    return prisma.ringSensitivity.upsert({
      where: { ringId },
      create: { ringId, sensitivity },
      update: { sensitivity },
    });
  },

  async deleteAll(): Promise<number> {
    const { count } = await prisma.ringSensitivity.deleteMany();
    return count;
  },
};
