-- ::neup.documentation::refactor-filefolder-storage-migration
-- ::title Refactor Filefolder Storage Migration
-- ::owner Neup Drive
--
-- ::private
--
-- Drops the legacy `File` table, renames `filefolder.activity` to
-- `filefolder.last_activity`, and normalizes `filefolder.stored_as` and
-- `filefolder.type` to the `drive | assets | signed` surface model while
-- preserving trash state inside `details`.
--
-- ::private end
--
-- ::end

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'filefolder'
          AND column_name = 'activity'
    ) THEN
        EXECUTE 'ALTER TABLE "filefolder" RENAME COLUMN "activity" TO "last_activity"';
    END IF;
END $$;

UPDATE "filefolder"
SET "stored_as" = CASE
    WHEN "stored_as" IN ('webfile', 'assets') THEN 'assets'
    WHEN "stored_as" IN ('webfile_signed', 'webfile_private', 'signed') THEN 'signed'
    WHEN "stored_as" = 'trash' THEN COALESCE(NULLIF("details"->>'previous_mode', ''), 'drive')
    ELSE 'drive'
END;

UPDATE "filefolder"
SET "type" = CASE
    WHEN "details"->>'status' = 'TRASHED' THEN COALESCE(NULLIF("details"->>'previous_mode', ''), "stored_as", 'drive')
    ELSE COALESCE(NULLIF("stored_as", ''), 'drive')
END;

ALTER TABLE "filefolder"
ALTER COLUMN "stored_as" SET DEFAULT 'drive';

DROP TABLE IF EXISTS "File";
