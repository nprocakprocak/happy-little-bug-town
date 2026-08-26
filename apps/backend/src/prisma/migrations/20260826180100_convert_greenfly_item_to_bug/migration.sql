-- Convert live greenfly items into bugs, then remove greenfly from ItemType.

INSERT INTO "Bug" ("id", "bugType", "x", "y", "authorId", "structureId", "stackId", "createdAt", "updatedAt", "removed_at")
SELECT "id", 'greenfly'::"BugType", "x", "y", "authorId", "structureId", "stackId", "createdAt", "updatedAt", "removed_at"
FROM "Item"
WHERE "itemType" = 'greenfly' AND "parentItemId" IS NULL;

UPDATE "Bug"
SET "stackId" = NULL
WHERE "stackId" IN (
  SELECT "id" FROM "Stack" WHERE "itemType" = 'greenfly'
);

DELETE FROM "Item" WHERE "itemType" = 'greenfly';

DELETE FROM "Stack" WHERE "itemType" = 'greenfly';

CREATE TYPE "ItemType_new" AS ENUM (
  'leaf_part',
  'little_rock',
  'root',
  'stick',
  'brick',
  'wood',
  'axe',
  'hammer_and_chisel',
  'leaf_rake',
  'shovel',
  'knife',
  'nettle_soup',
  'grilled_greenflies',
  'iron_ore',
  'clay',
  'glass',
  'paper',
  'crucible',
  'iron_ingot',
  'roof_tile',
  'wheelbarrel',
  'paving_stone',
  'plank',
  'plow',
  'mushroom',
  'pasta',
  'rotten_apple',
  'stuffed_fly'
);

ALTER TABLE "Item" ALTER COLUMN "itemType" TYPE "ItemType_new" USING ("itemType"::text::"ItemType_new");
ALTER TABLE "Stack" ALTER COLUMN "itemType" TYPE "ItemType_new" USING ("itemType"::text::"ItemType_new");
ALTER TYPE "ItemType" RENAME TO "ItemType_old";
ALTER TYPE "ItemType_new" RENAME TO "ItemType";
DROP TYPE "ItemType_old";
