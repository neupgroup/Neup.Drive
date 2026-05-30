-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "on_page" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "created_on" TIMESTAMPTZ NOT NULL DEFAULT now()
);
