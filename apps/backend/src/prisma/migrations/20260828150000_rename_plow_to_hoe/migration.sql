-- Rename ItemType enum value so existing plow rows become hoe.
ALTER TYPE "ItemType" RENAME VALUE 'plow' TO 'hoe';
