-- Add leaf_rake item type, delete leaf_rake tools, remove leaf_rake from ToolType.

ALTER TYPE "ItemType" ADD VALUE IF NOT EXISTS 'leaf_rake';

DELETE FROM "Item"
WHERE "toolId" IN (
  SELECT id FROM "Tool" WHERE "toolType"::text = 'leaf_rake'
);

DELETE FROM "Tool" WHERE "toolType"::text = 'leaf_rake';

CREATE TYPE "ToolType_new" AS ENUM ('shovel');
ALTER TABLE "Tool" ALTER COLUMN "toolType" TYPE "ToolType_new" USING ("toolType"::text::"ToolType_new");
DROP TYPE "ToolType";
ALTER TYPE "ToolType_new" RENAME TO "ToolType";
