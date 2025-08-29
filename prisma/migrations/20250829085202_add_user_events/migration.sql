-- CreateTable
CREATE TABLE "public"."UserEvent" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'personal',
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserEvent_userId_idx" ON "public"."UserEvent"("userId");

-- CreateIndex
CREATE INDEX "UserEvent_date_idx" ON "public"."UserEvent"("date");

-- CreateIndex
CREATE INDEX "UserEvent_type_idx" ON "public"."UserEvent"("type");

-- AddForeignKey
ALTER TABLE "public"."UserEvent" ADD CONSTRAINT "UserEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
