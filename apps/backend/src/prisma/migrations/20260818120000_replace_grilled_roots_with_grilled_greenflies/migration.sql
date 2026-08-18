-- Delete grilled_roots items (and their craft ingredients), then replace the enum value.

DELETE FROM "Item"
WHERE "parentItemId" IN (
  SELECT id FROM "Item" WHERE "itemType"::text = 'grilled_roots'
);

DELETE FROM "Item" WHERE "itemType"::text = 'grilled_roots';

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
  'greenfly',
  'glass',
  'paper',
  'crucible',
  'iron_ingot',
  'wheelbarrel'
);

ALTER TABLE "Item" ALTER COLUMN "itemType" TYPE "ItemType_new" USING ("itemType"::text::"ItemType_new");
ALTER TABLE "Stack" ALTER COLUMN "itemType" TYPE "ItemType_new" USING ("itemType"::text::"ItemType_new");
ALTER TYPE "ItemType" RENAME TO "ItemType_old";
ALTER TYPE "ItemType_new" RENAME TO "ItemType";
DROP TYPE "ItemType_old";
