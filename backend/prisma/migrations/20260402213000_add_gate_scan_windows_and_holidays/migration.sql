-- CreateTable
CREATE TABLE "GateScanWindow" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "allowedSemesters" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GateScanWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceHoliday" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GateScanWindow_dayOfWeek_isActive_idx" ON "GateScanWindow"("dayOfWeek", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceHoliday_date_key" ON "AttendanceHoliday"("date");

-- CreateIndex
CREATE INDEX "AttendanceHoliday_date_isActive_idx" ON "AttendanceHoliday"("date", "isActive");
