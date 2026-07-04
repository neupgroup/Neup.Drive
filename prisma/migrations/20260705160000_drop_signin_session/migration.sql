/*
::neup.documentation::drop-signin-session-migration

Drops the unused `SigninSession` table from the Prisma-managed database schema.

::public

Removes the obsolete sign-in session table and its data.

::public end

::private

The application no longer references this table, so the migration performs a
direct `DROP TABLE IF EXISTS`.

::private end

::end
*/
-- DropTable
DROP TABLE IF EXISTS "SigninSession";
