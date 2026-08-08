/*
::neup.documentation::root-page-redirect
::route /
::title Root Page Redirect
::owner Neup Drive

::public

Redirects the app root to the canonical homepage route.

::returns
::datatype never

The response always redirects to `/home`.

::public end

::end
*/
import { redirect } from 'next/navigation';
import { PRODRIVE_HOME_PATH } from '@/components/prodrive/routes';

export default function RootPage() {
  redirect(PRODRIVE_HOME_PATH);
}
