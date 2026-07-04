ALTER TABLE "filefolder"
ADD COLUMN "activity" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN "last_activity_on" TIMESTAMP(3),
ADD COLUMN "total_activity" INTEGER NOT NULL DEFAULT 0;
