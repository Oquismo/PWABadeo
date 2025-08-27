/*
  Warnings:

  - You are about to drop the column `school` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "school",
ADD COLUMN     "schoolId" INTEGER;

-- CreateTable
CREATE TABLE "public"."School" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT NOT NULL DEFAULT 'España',
    "phoneNumber" TEXT,
    "email" TEXT,
    "website" TEXT,
    "type" TEXT NOT NULL DEFAULT 'pública',
    "level" TEXT NOT NULL DEFAULT 'primaria',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "School_name_key" ON "public"."School"("name");

-- CreateIndex
CREATE INDEX "School_name_idx" ON "public"."School"("name");

-- CreateIndex
CREATE INDEX "School_city_idx" ON "public"."School"("city");

-- CreateIndex
CREATE INDEX "School_type_idx" ON "public"."School"("type");

-- CreateIndex
CREATE INDEX "School_level_idx" ON "public"."School"("level");

-- CreateIndex
CREATE INDEX "School_isActive_idx" ON "public"."School"("isActive");

-- CreateIndex
CREATE INDEX "User_schoolId_idx" ON "public"."User"("schoolId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
