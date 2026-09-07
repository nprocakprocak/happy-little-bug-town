-- CreateTable
CREATE TABLE "VisitedDialogue" (
    "id" TEXT NOT NULL,
    "dialogueId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitedDialogue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitedDialogue_authorId_idx" ON "VisitedDialogue"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "VisitedDialogue_authorId_dialogueId_key" ON "VisitedDialogue"("authorId", "dialogueId");

-- AddForeignKey
ALTER TABLE "VisitedDialogue" ADD CONSTRAINT "VisitedDialogue_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
