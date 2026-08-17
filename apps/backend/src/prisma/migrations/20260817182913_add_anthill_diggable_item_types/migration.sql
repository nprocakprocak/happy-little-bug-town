-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ItemType" ADD VALUE 'iron_ore';
ALTER TYPE "ItemType" ADD VALUE 'clay';
ALTER TYPE "ItemType" ADD VALUE 'greenfly';
ALTER TYPE "ItemType" ADD VALUE 'glass';
ALTER TYPE "ItemType" ADD VALUE 'paper';
