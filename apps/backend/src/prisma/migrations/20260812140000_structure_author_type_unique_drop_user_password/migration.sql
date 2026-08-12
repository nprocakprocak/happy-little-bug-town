-- AlterTable
ALTER TABLE "User" DROP COLUMN "password";

-- CreateIndex
CREATE UNIQUE INDEX "Structure_authorId_structureType_key" ON "Structure"("authorId", "structureType");
