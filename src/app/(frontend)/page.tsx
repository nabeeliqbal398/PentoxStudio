import React from 'react'

// Phase 1 placeholder; the layout (header, footer, floating buttons) now comes from the root layout.
// The real Home page (13 sections, CMS-driven) is built in Phase 4.
export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-site flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-4xl font-semibold text-brand md:text-5xl">Pentox Studio</h1>
      <p className="max-w-xl text-muted">Our new website is on its way.</p>
    </div>
  )
}
