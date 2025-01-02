-- CreateTable
CREATE TABLE "InvitationDesign" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#000000',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "logoUrl" TEXT,
    "headerImage" TEXT,
    "template" TEXT NOT NULL DEFAULT 'default',
    "customCss" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvitationDesign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvitationDesign_eventId_key" ON "InvitationDesign"("eventId");

-- CreateIndex
CREATE INDEX "InvitationDesign_eventId_idx" ON "InvitationDesign"("eventId");
