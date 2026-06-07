-- CreateTable
CREATE TABLE "filefolder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "size" BIGINT NOT NULL DEFAULT 0,
    "details" JSONB NOT NULL DEFAULT '{}',
    "created_on" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_on" TIMESTAMPTZ NOT NULL
);

-- CreateTable
CREATE TABLE "filefolder_log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filefolder_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "done_by" TEXT NOT NULL,
    "done_on" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "filefolder_log_filefolder_id_fkey" FOREIGN KEY ("filefolder_id") REFERENCES "filefolder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "filefolder_owner_idx" ON "filefolder"("owner");

-- CreateIndex
CREATE INDEX "filefolder_path_idx" ON "filefolder"("path");

-- CreateIndex
CREATE INDEX "filefolder_log_filefolder_id_idx" ON "filefolder_log"("filefolder_id");

-- CreateIndex
CREATE INDEX "filefolder_log_done_by_idx" ON "filefolder_log"("done_by");
