-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "parentItemId" TEXT;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
