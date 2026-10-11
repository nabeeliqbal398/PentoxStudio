import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

import type { FooterInfo, MenuGroup, SiteInfo } from '@/lib/site-data'

import { NewsletterSignup } from '../newsletter/NewsletterSignup'
import { CookieSettingsButton } from './CookieConsent'
import { LOGO_FALLBACK, LOGO_WHITE_FALLBACK, Logo } from './Logo'
import { SmartLink } from './SmartLink'

const linkClass = 'text-white/75 transition-colors hover:text-white focus-visible:text-white'
const headingClass = 'mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-white'

function ServiceColumn({ group }: { group: MenuGroup }) {
  return (
    <div>
      <p className={headingClass}>{group.label}</p>
      <ul className="space-y-2 text-sm">
        {group.items.map((item) => (
          <li key={item.id}>
            <Link className={`${linkClass} ${item.isChild ? 'ml-3 inline-block text-white/60' : ''}`} href={item.href}>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Brand strip, wavy top edge and the navy footer. Every block is built from the Footer,
 * Site settings and published content, and is left out when its data is empty.
 */
export function SiteFooter({
  site,
  footer,
  analyticsEnabled,
}: {
  site: SiteInfo
  footer: FooterInfo
  analyticsEnabled: boolean
}) {
  const year = String(new Date().getFullYear())
  const copyright = footer.copyrightText?.replaceAll('{year}', year)
  const hasContact =
    site.phone || site.email || site.addressLines.length > 0 || site.hours.length > 0 || site.responseTime
  const hasBrandStrip = footer.brandHeading || footer.brandStatement

  return (
    <footer>
      {hasBrandStrip && (
        <section className="mx-auto grid max-w-site items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
          <div className="space-y-4">
            <Logo
              className="h-20 w-auto"
              fallback={LOGO_FALLBACK}
              image={site.logo}
              name={site.businessName}
            />
            {footer.brandHeading && (
              <p className="font-heading text-xl text-muted">{footer.brandHeading}</p>
            )}
          </div>
          {footer.brandStatement && (
            <p className="font-heading text-3xl font-bold uppercase leading-tight text-navy md:text-5xl">
              {footer.brandStatement}
            </p>
          )}
        </section>
      )}

      {/* Wavy red/navy top edge */}
      <div aria-hidden="true" className="-mb-px leading-none text-navy">
        <svg className="block h-8 w-full md:h-12" preserveAspectRatio="none" viewBox="0 0 1200 48">
          <path d="M0 24 C150 4 300 44 450 24 S750 4 900 24 1050 44 1200 24 V48 H0 Z" fill="#DD2C33" opacity=".85" />
          <path d="M0 32 C150 12 300 52 450 32 S750 12 900 32 1050 52 1200 32 V48 H0 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="bg-navy text-white">
        <div className="mx-auto grid max-w-site gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-12">
          {hasContact && (
            <div className="space-y-3 text-sm lg:col-span-3">
              <Logo
                className="mb-4 h-16 w-auto"
                fallback={LOGO_WHITE_FALLBACK}
                image={site.logoWhite}
                name={site.businessName}
              />
              {site.addressLines.length > 0 && (
                <p className="flex gap-2 text-white/75">
                  <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <span>
                    {site.addressLines.map((line) => (
                      <span className="block" key={line}>
                        {line}
                      </span>
                    ))}
                  </span>
                </p>
              )}
              {site.phone && (
                <p className="flex items-center gap-2">
                  <Phone aria-hidden="true" className="size-4 shrink-0 text-white/75" />
                  <a className={linkClass} href={site.phone.href}>
                    {site.phone.display}
                  </a>
                </p>
              )}
              {site.email && (
                <p className="flex items-center gap-2">
                  <Mail aria-hidden="true" className="size-4 shrink-0 text-white/75" />
                  <a className={`${linkClass} break-all`} href={site.email.href}>
                    {site.email.address}
                  </a>
                </p>
              )}
              {site.hours.length > 0 && (
                <p className="flex gap-2 text-white/75">
                  <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <span>
                    {site.hours.map((row) => (
                      <span className="block" key={row}>
                        {row}
                      </span>
                    ))}
                  </span>
                </p>
              )}
              {site.responseTime && <p className="text-white/75">{site.responseTime}</p>}
            </div>
          )}

          {footer.serviceGroups.length > 0 && (
            <div className="grid gap-8 sm:grid-cols-2 md:col-span-2 lg:col-span-5">
              {footer.serviceGroups.map((group) => (
                <ServiceColumn group={group} key={group.label} />
              ))}
            </div>
          )}

          {(footer.industries.length > 0 || footer.columns.length > 0 || site.socials.length > 0) && (
            <div className="grid gap-8 sm:grid-cols-2 md:col-span-2 lg:col-span-4">
              {footer.industries.length > 0 && (
                <div>
                  <p className={headingClass}>Industries</p>
                  <ul className="space-y-2 text-sm">
                    {footer.industries.map((industry) => (
                      <li key={industry.id}>
                        <Link className={linkClass} href={industry.href}>
                          {industry.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {footer.columns.map((column) => (
                <div key={column.title}>
                  <p className={headingClass}>{column.title}</p>
                  <ul className="space-y-2 text-sm">
                    {column.links.map((link) => (
                      <li key={`${link.label}-${link.href}`}>
                        <SmartLink className={linkClass} link={link} newTab={link.newTab}>
                          {link.label}
                        </SmartLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {site.socials.length > 0 && (
                <div>
                  <p className={headingClass}>Follow us</p>
                  <ul className="space-y-2 text-sm">
                    {site.socials.map((social) => (
                      <li key={social.platform + social.href}>
                        <a className={linkClass} href={social.href} rel="noopener noreferrer" target="_blank">
                          {social.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Newsletter signup (double opt-in) */}
        <div className="border-t border-white/15">
          <div className="mx-auto max-w-site px-4 py-8 md:max-w-2xl">
            <NewsletterSignup heading={footer.newsletter?.heading} source="footer" text={footer.newsletter?.text} tone="dark" />
          </div>
        </div>

        {(copyright || footer.legalLinks.length > 0 || analyticsEnabled) && (
          <div className="border-t border-white/15">
            <div className="mx-auto flex max-w-site flex-col gap-3 px-4 py-5 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
              {copyright && <p>{copyright}</p>}
              <ul className="flex flex-wrap gap-x-5 gap-y-1">
                {footer.legalLinks.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <SmartLink className={linkClass} link={link} newTab={link.newTab}>
                      {link.label}
                    </SmartLink>
                  </li>
                ))}
                {analyticsEnabled && (
                  <li>
                    <CookieSettingsButton className={linkClass} />
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </footer>
  )
}
