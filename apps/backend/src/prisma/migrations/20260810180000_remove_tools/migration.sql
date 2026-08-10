-- Remove all tools and drop Tool table / Item.toolId.

DELETE FROM "Item" WHERE "toolId" IS NOT NULL;

ALTER TABLE "Item" DROP CONSTRAINT IF EXISTS "Item_toolId_fkey";
ALTER TABLE "Item" DROP COLUMN IF EXISTS "toolId";

DROP TABLE IF EXISTS "Tool";
