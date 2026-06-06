-- CreateTable
CREATE TABLE "SigninSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aid" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "skey" TEXT NOT NULL,
    "accountId" TEXT,
    "expires_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "SigninSession_aid_sid_skey_idx" ON "SigninSession" ("aid", "sid", "skey");
