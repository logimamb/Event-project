-- Add memberCode field to EventMember
ALTER TABLE "EventMember" ADD COLUMN "memberCode" TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX "EventMember_memberCode_key" ON "EventMember"("memberCode");

-- Update existing records with unique member codes
UPDATE "EventMember" 
SET "memberCode" = 'mem_' || substr(md5(random()::text), 1, 20)
WHERE "memberCode" = '';
