-- AlterTable
ALTER TABLE "Structure" ADD COLUMN "removed_at" TIMESTAMP(3);

-- DropIndex
DROP INDEX "Structure_authorId_structureType_key";

-- CreateIndex
CREATE INDEX "Structure_authorId_structureType_idx" ON "Structure"("authorId", "structureType");

-- CreateIndex
CREATE UNIQUE INDEX "Structure_authorId_structureType_active_key" ON "Structure"("authorId", "structureType") WHERE "removed_at" IS NULL;
