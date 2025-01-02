-- Create Activity table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Activity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- Add indexes
CREATE INDEX IF NOT EXISTS "Activity_eventId_idx" ON "Activity"("eventId");
CREATE INDEX IF NOT EXISTS "Activity_userId_idx" ON "Activity"("userId");

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'Activity_eventId_fkey'
    ) THEN
        ALTER TABLE "Activity"
        ADD CONSTRAINT "Activity_eventId_fkey"
        FOREIGN KEY ("eventId")
        REFERENCES "Event"("id")
        ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'Activity_userId_fkey'
    ) THEN
        ALTER TABLE "Activity"
        ADD CONSTRAINT "Activity_userId_fkey"
        FOREIGN KEY ("userId")
        REFERENCES "User"("id");
    END IF;
END $$;
