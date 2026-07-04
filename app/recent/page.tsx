/*
::neup.documentation::recent-page-redirect
::route /recent
::title Recent Redirect
::owner Neup Drive

::public

Redirects the singular recent alias to the homepage so older or mistyped links
still reach the recent-items landing page.

::returns
::datatype never

The response always redirects to `/`.

::public end

::end
*/
import { redirect } from 'next/navigation';

export default function RecentPage() {
  redirect('/');
}
