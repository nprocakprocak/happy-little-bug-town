-- CreateEnum
CREATE TYPE "ToolType" AS ENUM ('leaf_rake', 'shovel');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "toolId" TEXT;

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "toolType" "ToolType" NOT NULL,
    "x" INTEGER,
    "y" INTEGER,
    "authorId" TEXT NOT NULL,
    "structureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
