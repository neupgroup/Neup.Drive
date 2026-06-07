-- CreateTable
CREATE TABLE "system_error" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "on_account" TEXT,
    "type" TEXT NOT NULL,
    "log" TEXT NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "logged_on" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CreateIndex
CREATE INDEX "system_error_on_account_idx" ON "system_error"("on_account");

-- CreateIndex
CREATE INDEX "system_error_type_idx" ON "system_error"("type");
