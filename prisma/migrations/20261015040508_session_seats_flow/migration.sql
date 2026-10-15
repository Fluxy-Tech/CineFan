-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "availableSeats" TEXT[];

-- AlterTable
ALTER TABLE "SessionUser" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "idCallback" TEXT,
ADD COLUMN     "idDatabase" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "statusReason" TEXT;
