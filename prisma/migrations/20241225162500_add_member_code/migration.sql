-- Add memberCode column as nullable first
ALTER TABLE "EventMember" ADD COLUMN IF NOT EXISTS "memberCode" TEXT;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS "EventMember_memberCode_key" ON "EventMember"("memberCode");

-- Update existing NULL values with unique codes
UPDATE "EventMember"
SET "memberCode" = 'mem_' || substr(md5(random()::text), 1, 10)
WHERE "memberCode" IS NULL;

-- Make the column required
ALTER TABLE "EventMember" ALTER COLUMN "memberCode" SET NOT NULL;
