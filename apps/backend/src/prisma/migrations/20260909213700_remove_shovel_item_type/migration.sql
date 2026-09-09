-- Delete shovel items (and their craft ingredients), then remove the enum value.

DELETE FROM "Item"
WHERE "parentItemId" IN (
  SELECT id FROM "Item" WHERE "itemType"::text = 'shovel'
);

DELETE FROM "Item" WHERE "itemType"::text = 'shovel';

DELETE FROM "Stack" WHERE "itemType"::text = 'shovel';

CREATE TYPE "ItemType_new" AS ENUM (
  'leaf_part',
  'little_rock',
  'root',
  'stick',
  'brick',
  'wood',
  'axe',
  'hammer',
  'hammer_and_chisel',
  'leaf_rake',
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
  'hoe',
  'mushroom',
  'pasta',
  'rotten_apple',
  'stuffed_fly',
  'seeds',
  'gravel',
  'concrete',
  'steel',
  'basket',
  'furniture',
  'sculpture',
  'desk',
  'fountain',
  'book',
  'flower'
);

ALTER TABLE "Item" ALTER COLUMN "itemType" TYPE "ItemType_new" USING ("itemType"::text::"ItemType_new");
ALTER TABLE "Stack" ALTER COLUMN "itemType" TYPE "ItemType_new" USING ("itemType"::text::"ItemType_new");
ALTER TYPE "ItemType" RENAME TO "ItemType_old";
ALTER TYPE "ItemType_new" RENAME TO "ItemType";
DROP TYPE "ItemType_old";
