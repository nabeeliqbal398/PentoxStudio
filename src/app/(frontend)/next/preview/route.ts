import { draftMode, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@payload-config'

// Entry point for the admin "Live Preview" iframe and "Preview" button (see lib/paths.ts).
// Only a logged-in admin user can switch draft mode on; it is checked again on every draft read
// (lib/content.ts getViewer), so the cookie alone never reveals drafts.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path') ?? '/'

  // Same-site paths only (no protocol-relative or absolute URLs): prevents open redirects.
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return new Response('Invalid path', { status: 400 })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return new Response('You are not allowed to preview this page.', { status: 403 })

  const draft = await draftMode()
  draft.enable()
  redirect(path)
}
