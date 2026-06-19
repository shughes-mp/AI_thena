-- AlterTable
ALTER TABLE "StudentSession" ADD COLUMN "accessTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "StudentSession_accessTokenHash_key" ON "StudentSession"("accessTokenHash");
