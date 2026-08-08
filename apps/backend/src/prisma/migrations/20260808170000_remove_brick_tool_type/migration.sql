-- Delete brick tools (and their craft ingredients), then remove brick from ToolType.

DELETE FROM "Item"
WHERE "toolId" IN (
  SELECT id FROM "Tool" WHERE "toolType"::text = 'brick'
);

DELETE FROM "Tool" WHERE "toolType"::text = 'brick';

CREATE TYPE "ToolType_new" AS ENUM ('leaf_rake', 'shovel', 'hammer_and_chisel', 'axe', 'wood');
ALTER TABLE "Tool" ALTER COLUMN "toolType" TYPE "ToolType_new" USING ("toolType"::text::"ToolType_new");
DROP TYPE "ToolType";
ALTER TYPE "ToolType_new" RENAME TO "ToolType";
