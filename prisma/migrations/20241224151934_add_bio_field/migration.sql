/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `currentAttendees` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `EventCategory` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_accessibilityId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_userId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityInvitation" DROP CONSTRAINT "ActivityInvitation_activityId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityParticipant" DROP CONSTRAINT "ActivityParticipant_activityId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityParticipant" DROP CONSTRAINT "ActivityParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_locationId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_userId_fkey";

-- DropForeignKey
ALTER TABLE "EventMember" DROP CONSTRAINT "EventMember_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventMember" DROP CONSTRAINT "EventMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "EventShare" DROP CONSTRAINT "EventShare_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventShare" DROP CONSTRAINT "EventShare_userId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationSettings" DROP CONSTRAINT "NotificationSettings_activityId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationSettings" DROP CONSTRAINT "NotificationSettings_eventId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationSettings" DROP CONSTRAINT "NotificationSettings_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_locationId_fkey";

-- DropForeignKey
ALTER TABLE "VerificationCode" DROP CONSTRAINT "VerificationCode_userId_fkey";

-- DropIndex
DROP INDEX "Event_categoryId_idx";

-- DropIndex
DROP INDEX "Event_locationId_idx";

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "expires_at" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "categoryId",
DROP COLUMN "currentAttendees",
ADD COLUMN     "calendarId" TEXT,
ALTER COLUMN "isPublic" SET DEFAULT true,
ALTER COLUMN "maxAttendees" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "calendarSync" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "emailNotifications" BOOLEAN,
ADD COLUMN     "pushNotifications" BOOLEAN,
ADD COLUMN     "website" TEXT,
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "EventCategory";

-- CreateTable
CREATE TABLE "Calendar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Calendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_locationId_calendarId_idx" ON "Event"("locationId", "calendarId");
