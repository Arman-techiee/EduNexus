ALTER TABLE "RefreshToken"
ADD COLUMN "ipAddress" TEXT,
ADD COLUMN "lastUsedAt" TIMESTAMP(3),
ADD COLUMN "userAgent" TEXT;

CREATE INDEX "RefreshToken_userId_revokedAt_expiresAt_idx"
ON "RefreshToken"("userId", "revokedAt", "expiresAt");
