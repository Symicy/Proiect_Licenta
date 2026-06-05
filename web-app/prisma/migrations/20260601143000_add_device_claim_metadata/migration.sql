ALTER TABLE "Device"
ADD COLUMN "claimCodeHash" TEXT,
ADD COLUMN "claimCodeLabel" TEXT,
ADD COLUMN "claimCodeCustomerType" "CustomerType",
ADD COLUMN "claimedAt" TIMESTAMP(3);

ALTER TABLE "Device" DROP CONSTRAINT "Device_userId_fkey";

ALTER TABLE "Device" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "Device"
ADD CONSTRAINT "Device_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Device_claimCodeHash_idx" ON "Device"("claimCodeHash");
CREATE INDEX "Device_claimCodeCustomerType_idx" ON "Device"("claimCodeCustomerType");
