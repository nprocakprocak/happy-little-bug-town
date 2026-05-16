-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "stackId" TEXT,
ALTER COLUMN "x" DROP NOT NULL,
ALTER COLUMN "y" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Stack" (
    "id" TEXT NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stack_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "Stack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stack" ADD CONSTRAINT "Stack_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
