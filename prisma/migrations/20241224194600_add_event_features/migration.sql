/*
  Warnings:

  - You are about to drop the column `requirements` on the `Accessibility` table. All the data in the column will be lost.
  - You are about to drop the column `capacity` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `inviteCode` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `shareableSlug` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `ActivityInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `ActivityInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `joinedAt` on the `ActivityParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `googleCalendarEventId` on the `Event` table. All the data in the column will be lost.
  - Added the required column `name` to the `Accessibility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('OFFLINE', 'ONLINE', 'HYBRID');

-- DropIndex
DROP INDEX "Activity_inviteCode_key";

-- DropIndex
DROP INDEX "Activity_shareableSlug_key";

-- DropIndex
DROP INDEX "ActivityInvitation_email_idx";

-- DropIndex
DROP INDEX "ActivityInvitation_token_key";

-- DropIndex
DROP INDEX "ActivityParticipant_activityId_userId_key";

-- DropIndex
DROP INDEX "EventMember_eventId_userId_key";

-- AlterTable
ALTER TABLE "Accessibility" DROP COLUMN "requirements",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "otherOptions" JSONB,
ADD COLUMN     "signLanguage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subtitles" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transcription" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "wheelchairAccess" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "capacity",
DROP COLUMN "endTime",
DROP COLUMN "inviteCode",
DROP COLUMN "location",
DROP COLUMN "shareableSlug",
DROP COLUMN "startTime",
DROP COLUMN "status",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ActivityInvitation" DROP COLUMN "expiresAt",
DROP COLUMN "token",
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "ActivityParticipant" DROP COLUMN "joinedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "googleCalendarEventId",
ADD COLUMN     "eventType" "EventType" NOT NULL DEFAULT 'OFFLINE';

-- AlterTable
ALTER TABLE "EventMember" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "available" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marketing" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "emailCampaign" JSONB,
    "socialMedia" JSONB,
    "analytics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Marketing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AccessibilityToEvent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AccessibilityToEvent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Marketing_eventId_key" ON "Marketing"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_eventId_key" ON "Budget"("eventId");

-- CreateIndex
CREATE INDEX "_AccessibilityToEvent_B_index" ON "_AccessibilityToEvent"("B");

-- CreateIndex
CREATE INDEX "Activity_accessibilityId_idx" ON "Activity"("accessibilityId");
