import Image from 'next/image'
import React from 'react'

// Phase 1 placeholder: proves the layout, fonts and brand tokens work.
// The real Home page (13 sections, CMS-driven) is built in Phase 4.
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-site flex-col items-center justify-center gap-6 px-4 text-center">
      <Image alt="Pentox Studio" height={141} priority src="/brand/logo.webp" width={170} />
      <h1 className="font-heading text-4xl font-semibold text-brand md:text-5xl">Pentox Studio</h1>
      <p className="max-w-xl text-muted">Our new website is on its way.</p>
    </main>
  )
}
