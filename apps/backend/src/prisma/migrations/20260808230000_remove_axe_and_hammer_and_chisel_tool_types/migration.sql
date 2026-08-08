-- Delete axe and hammer_and_chisel tools (and their craft ingredients), then remove them from ToolType.

DELETE FROM "Item"
WHERE "toolId" IN (
  SELECT id FROM "Tool" WHERE "toolType"::text IN ('axe', 'hammer_and_chisel')
);

DELETE FROM "Tool" WHERE "toolType"::text IN ('axe', 'hammer_and_chisel');

CREATE TYPE "ToolType_new" AS ENUM ('leaf_rake', 'shovel');
ALTER TABLE "Tool" ALTER COLUMN "toolType" TYPE "ToolType_new" USING ("toolType"::text::"ToolType_new");
DROP TYPE "ToolType";
ALTER TYPE "ToolType_new" RENAME TO "ToolType";
