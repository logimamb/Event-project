-- AlterTable
ALTER TABLE "EventMember" ADD COLUMN "memberCode" TEXT NOT NULL DEFAULT gen_random_uuid();
