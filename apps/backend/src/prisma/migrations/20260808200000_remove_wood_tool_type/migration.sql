-- Delete wood tools (and their craft ingredients), then remove wood from ToolType.

DELETE FROM "Item"
WHERE "toolId" IN (
  SELECT id FROM "Tool" WHERE "toolType"::text = 'wood'
);

DELETE FROM "Tool" WHERE "toolType"::text = 'wood';

CREATE TYPE "ToolType_new" AS ENUM ('leaf_rake', 'shovel', 'hammer_and_chisel', 'axe');
ALTER TABLE "Tool" ALTER COLUMN "toolType" TYPE "ToolType_new" USING ("toolType"::text::"ToolType_new");
DROP TYPE "ToolType";
ALTER TYPE "ToolType_new" RENAME TO "ToolType";
