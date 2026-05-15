-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('leaf_part', 'little_rock');

-- CreateEnum
CREATE TYPE "MineType" AS ENUM ('hole');

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mine" (
    "id" TEXT NOT NULL,
    "mineType" "MineType" NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "span" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mine_pkey" PRIMARY KEY ("id")
);
