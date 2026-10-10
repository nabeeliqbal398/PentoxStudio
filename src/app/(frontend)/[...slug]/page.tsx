import { notFound } from 'next/navigation'

// Any public URL that no page handles lands here and renders the branded 404 (not-found.tsx)
// inside the normal site layout. More specific routes added in later phases take precedence.
export default function UnmatchedPage() {
  notFound()
}
