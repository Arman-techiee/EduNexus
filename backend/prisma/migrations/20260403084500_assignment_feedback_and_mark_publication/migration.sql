-- AlterTable
ALTER TABLE "Submission"
ADD COLUMN "feedback" TEXT;

-- AlterTable
ALTER TABLE "Mark"
ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "publishedAt" TIMESTAMP(3),
ADD COLUMN "publishedBy" TEXT;

-- CreateIndex
CREATE INDEX "Mark_subjectId_isPublished_idx" ON "Mark"("subjectId", "isPublished");
