-- AlterTable
ALTER TABLE "TicketMoviesUser" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "idCallback" TEXT,
ADD COLUMN     "idDatabase" TEXT,
ADD COLUMN     "statusReason" TEXT;
