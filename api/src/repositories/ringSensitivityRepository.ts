import { prisma, type DbClient } from "../db/prisma.js";

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

  // `db` lets a caller run this inside prisma.$transaction alongside the
  // other tables' deleteAll.
  async deleteAll(db: DbClient = prisma): Promise<number> {
    const { count } = await db.ringSensitivity.deleteMany();
    return count;
  },
};
