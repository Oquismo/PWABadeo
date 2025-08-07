-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "arrivalDate" TEXT,
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "departureDate" TEXT,
ADD COLUMN     "school" TEXT;

-- CreateTable
CREATE TABLE "public"."Announcement" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Announcement" ADD CONSTRAINT "Announcement_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
