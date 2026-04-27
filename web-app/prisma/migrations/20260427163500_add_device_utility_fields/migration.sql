-- CreateEnum
CREATE TYPE "UtilityType" AS ENUM ('ELECTRICITY', 'GAS', 'WATER', 'HEATING', 'COOLING', 'OTHER');

-- AlterTable
ALTER TABLE "Device"
ADD COLUMN "utilityType" "UtilityType" NOT NULL DEFAULT 'ELECTRICITY',
ADD COLUMN "tariffPerUnit" DOUBLE PRECISION,
ADD COLUMN "unitLabel" TEXT;

UPDATE "Device"
SET
  "tariffPerUnit" = "energyTariff",
  "unitLabel" = 'kWh'
WHERE "tariffPerUnit" IS NULL
   OR "unitLabel" IS NULL;

ALTER TABLE "Device"
ALTER COLUMN "tariffPerUnit" SET NOT NULL,
ALTER COLUMN "unitLabel" SET NOT NULL;

-- Drop legacy electricity-only field
ALTER TABLE "Device"
DROP COLUMN "energyTariff";
