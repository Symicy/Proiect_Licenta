-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "customerType" "CustomerType";

UPDATE "User"
SET "customerType" = 'INDIVIDUAL'
WHERE "role" = 'CUSTOMER'
  AND "customerType" IS NULL;

ALTER TABLE "User"
ADD CONSTRAINT "User_customerType_role_check"
CHECK (
  ("role" = 'CUSTOMER' AND "customerType" IS NOT NULL)
  OR
  ("role" = 'ADMIN' AND "customerType" IS NULL)
);
