-- Add shovel item type, delete shovel tools, keep Tool table with text toolType for future tools.

ALTER TYPE "ItemType" ADD VALUE IF NOT EXISTS 'shovel';

DELETE FROM "Item"
WHERE "toolId" IN (
  SELECT id FROM "Tool" WHERE "toolType"::text = 'shovel'
);

DELETE FROM "Tool" WHERE "toolType"::text = 'shovel';

ALTER TABLE "Tool" ALTER COLUMN "toolType" TYPE TEXT USING ("toolType"::text);
DROP TYPE "ToolType";
