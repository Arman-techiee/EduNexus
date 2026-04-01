ALTER TABLE "Student"
ADD COLUMN "fatherName" TEXT,
ADD COLUMN "motherName" TEXT,
ADD COLUMN "fatherPhone" TEXT,
ADD COLUMN "motherPhone" TEXT,
ADD COLUMN "bloodGroup" TEXT,
ADD COLUMN "localGuardianName" TEXT,
ADD COLUMN "localGuardianAddress" TEXT,
ADD COLUMN "localGuardianPhone" TEXT,
ADD COLUMN "permanentAddress" TEXT,
ADD COLUMN "temporaryAddress" TEXT;

ALTER TABLE "StudentApplication"
ADD COLUMN "fatherName" TEXT,
ADD COLUMN "motherName" TEXT,
ADD COLUMN "fatherPhone" TEXT,
ADD COLUMN "motherPhone" TEXT,
ADD COLUMN "bloodGroup" TEXT,
ADD COLUMN "localGuardianName" TEXT,
ADD COLUMN "localGuardianAddress" TEXT,
ADD COLUMN "localGuardianPhone" TEXT,
ADD COLUMN "permanentAddress" TEXT,
ADD COLUMN "temporaryAddress" TEXT;

UPDATE "StudentApplication"
SET
  "fatherName" = COALESCE("fatherName", "guardianName", 'Not Provided'),
  "motherName" = COALESCE("motherName", 'Not Provided'),
  "fatherPhone" = COALESCE("fatherPhone", "guardianPhone", 'Not Provided'),
  "motherPhone" = COALESCE("motherPhone", 'Not Provided'),
  "localGuardianName" = COALESCE("localGuardianName", "guardianName", 'Not Provided'),
  "localGuardianAddress" = COALESCE("localGuardianAddress", "address", 'Address not provided'),
  "localGuardianPhone" = COALESCE("localGuardianPhone", "guardianPhone", 'Not Provided'),
  "permanentAddress" = COALESCE("permanentAddress", "address", 'Address not provided'),
  "temporaryAddress" = COALESCE("temporaryAddress", "address", 'Address not provided');

ALTER TABLE "StudentApplication"
ALTER COLUMN "fatherName" SET NOT NULL,
ALTER COLUMN "motherName" SET NOT NULL,
ALTER COLUMN "fatherPhone" SET NOT NULL,
ALTER COLUMN "motherPhone" SET NOT NULL,
ALTER COLUMN "localGuardianName" SET NOT NULL,
ALTER COLUMN "localGuardianAddress" SET NOT NULL,
ALTER COLUMN "localGuardianPhone" SET NOT NULL,
ALTER COLUMN "permanentAddress" SET NOT NULL,
ALTER COLUMN "temporaryAddress" SET NOT NULL;

ALTER TABLE "StudentApplication"
DROP COLUMN "address",
DROP COLUMN "guardianName",
DROP COLUMN "guardianPhone",
DROP COLUMN "notes";
