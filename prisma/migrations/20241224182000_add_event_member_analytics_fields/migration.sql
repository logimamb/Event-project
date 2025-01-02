-- First, add new columns with defaults
ALTER TABLE "EventMember" 
ADD COLUMN "email" TEXT NOT NULL DEFAULT '',
ADD COLUMN "name" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "notifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "attended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "feedback" TEXT,
ADD COLUMN "rating" INTEGER,
ADD COLUMN "interactions" INTEGER NOT NULL DEFAULT 0;

-- Update existing records to set email from user relation
UPDATE "EventMember" em
SET "email" = u.email
FROM "User" u
WHERE em."userId" = u.id;

-- Add unique constraint for eventId and email
ALTER TABLE "EventMember" ADD CONSTRAINT "EventMember_eventId_email_key" UNIQUE ("eventId", "email");

-- Drop and recreate role column with new default
ALTER TABLE "EventMember" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "EventMember" ALTER COLUMN "role" TYPE TEXT USING role::TEXT;
ALTER TABLE "EventMember" ALTER COLUMN "role" SET DEFAULT 'ATTENDEE';

-- Add status column
ALTER TABLE "EventMember" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING';
