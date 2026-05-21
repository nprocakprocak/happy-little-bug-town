ALTER TYPE "MineType" RENAME TO "StructureType";

ALTER TABLE "Mine" RENAME TO "Structure";

ALTER TABLE "Structure" RENAME COLUMN "mineType" TO "structureType";

ALTER TABLE "Structure" RENAME CONSTRAINT "Mine_pkey" TO "Structure_pkey";
ALTER TABLE "Structure" RENAME CONSTRAINT "Mine_authorId_fkey" TO "Structure_authorId_fkey";
