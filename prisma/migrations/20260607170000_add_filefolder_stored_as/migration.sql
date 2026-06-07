ALTER TABLE "filefolder"
ADD COLUMN IF NOT EXISTS "stored_as" TEXT NOT NULL DEFAULT 'drivefile';

CREATE INDEX IF NOT EXISTS "filefolder_stored_as_idx" ON "filefolder"("stored_as");
