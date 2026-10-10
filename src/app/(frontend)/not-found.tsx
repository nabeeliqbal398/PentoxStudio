import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { SmartLink } from '@/components/site/SmartLink'
import { Squiggle } from '@/components/site/Squiggle'
import { getHeaderInfo, getPopularServices } from '@/lib/site-data'

// Next.js adds noindex to not-found pages automatically.
export const metadata: Metadata = {
  title: 'Page not found',
}

export default async function NotFound() {
  const [header, services] = await Promise.all([getHeaderInfo(), getPopularServices()])

  return (
    <div className="mx-auto max-w-site px-4 py-16 text-center md:py-24">
      <p className="font-heading text-lg text-muted">Error 404</p>
      <h1 className="mt-2 font-heading text-5xl font-semibold text-brand md:text-7xl">Page not found</h1>
      <Squiggle className="my-6" />
      <p className="mx-auto max-w-xl text-lg text-muted">
        The page you are looking for may have moved or no longer exists. Try one of these instead.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          className="rounded-full border-[1.5px] border-navy px-7 py-3 font-medium text-navy hover:bg-navy hover:text-white"
          href="/"
        >
          Back to home
        </Link>
        {header.cta && (
          <SmartLink
            className="rounded-full bg-brand px-7 py-3 font-medium text-white hover:bg-brand-active"
            link={header.cta.link}
          >
            {header.cta.label}
          </SmartLink>
        )}
      </div>

      {services.length > 0 && (
        <section aria-labelledby="popular-services" className="mt-16">
          <h2 className="font-heading text-2xl font-medium text-navy" id="popular-services">
            Popular services
          </h2>
          <ul className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-2 md:grid-cols-3">
            {services.map((service) => (
              <li key={service.id}>
                <Link
                  className="block rounded-xl bg-white px-4 py-3 text-sm font-medium text-navy shadow-soft transition-colors hover:text-brand focus-visible:text-brand"
                  href={service.href}
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
