-- AlterTable
ALTER TABLE "Bug" ADD COLUMN "stackId" TEXT;

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "Stack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
