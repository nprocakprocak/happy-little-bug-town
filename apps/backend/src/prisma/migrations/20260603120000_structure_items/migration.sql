ALTER TABLE "Item" ADD COLUMN "structureId" TEXT;

ALTER TABLE "Item" ADD CONSTRAINT "Item_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
