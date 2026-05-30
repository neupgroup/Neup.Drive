-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account_type" TEXT NOT NULL,
    "connection_id" TEXT,
    "display_name" TEXT,
    "display_image" TEXT,
    "neupid" TEXT,
    "created_on" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "accessed_on" TIMESTAMPTZ,
    "role_id" TEXT
);
