/*
  Warnings:

  - You are about to drop the column `logoUrl` on the `InvitationDesign` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "InvitationDesign_eventId_idx";

-- AlterTable
ALTER TABLE "InvitationDesign" DROP COLUMN "logoUrl",
ADD COLUMN     "accentColor" TEXT NOT NULL DEFAULT '#4f46e5',
ADD COLUMN     "animation" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "backgroundPattern" TEXT,
ADD COLUMN     "borderRadius" TEXT NOT NULL DEFAULT '8',
ADD COLUMN     "fontSize" TEXT NOT NULL DEFAULT '16',
ADD COLUMN     "layout" TEXT NOT NULL DEFAULT 'centered',
ADD COLUMN     "spacing" TEXT NOT NULL DEFAULT 'normal';
