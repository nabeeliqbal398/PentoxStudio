// Shown above the Leads list. Plain link: the browser sends the admin session cookie.
export const ExportLeadsButton = () => (
  <div style={{ marginBottom: 16 }}>
    {/* A file download, so a plain link (not client-side navigation) is what is wanted. */}
    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
    <a className="btn btn--style-secondary btn--size-medium" href="/api/leads/export/">
      <span className="btn__content">Export all leads (CSV)</span>
    </a>
  </div>
)
