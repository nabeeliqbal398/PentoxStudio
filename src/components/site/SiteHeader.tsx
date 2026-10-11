'use client'

import { Mail, Menu, Phone } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { HeaderInfo, SiteInfo } from '@/lib/site-data'

import { LOGO_FALLBACK, Logo } from './Logo'
import { MegaMenu } from './MegaMenu'
import { MobileMenu } from './MobileMenu'
import { SmartLink } from './SmartLink'

// Hysteresis so the header doesn't flicker around a single scroll position.
const COMPACT_AFTER = 60
const EXPAND_BELOW = 10

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href)

/**
 * Fixed header: top bar (phone, email, socials) + logo, grouped mega menu, links and CTA.
 * After scrolling the top bar collapses and the nav links give way to a hamburger that
 * opens the full-screen menu. Below `lg` the hamburger is always used.
 */
export function SiteHeader({ site, header }: { site: SiteInfo; header: HeaderInfo }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const menuOpen = menuPath === pathname
  const hamburger = useRef<HTMLButtonElement>(null)
  const closeMenu = useCallback(() => setMenuPath(null), [])

  useEffect(() => {
    const onScroll = () =>
      setScrolled((current) =>
        current ? window.scrollY > EXPAND_BELOW : window.scrollY > COMPACT_AFTER,
      )
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const hasTopBar =
    header.showTopBar && Boolean(site.phone || site.email || site.socials.length > 0)
  const showNav = !scrolled
  const hasNavItems = header.groups.length > 0 || header.links.length > 0

  return (
    <>
      {/* The header is fixed, so this spacer reserves its expanded height and nothing shifts on scroll. */}
      <div aria-hidden="true" className={hasTopBar ? 'h-16 md:h-28' : 'h-16 md:h-[72px]'} />

      <header className="fixed inset-x-0 top-0 z-40">
        {hasTopBar && (
          <div
            className={`hidden bg-navy text-white transition-[grid-template-rows] duration-300 md:grid ${
              scrolled ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
            }`}
            inert={scrolled}
          >
            <div className="overflow-hidden">
              <div className="mx-auto flex h-10 max-w-site items-center justify-between px-4 text-sm">
                <div className="flex items-center gap-5">
                  {site.phone && (
                    <a className="flex items-center gap-1.5 hover:text-white/80" href={site.phone.href}>
                      <Phone aria-hidden="true" className="size-3.5" /> {site.phone.display}
                    </a>
                  )}
                  {site.email && (
                    <a className="flex items-center gap-1.5 hover:text-white/80" href={site.email.href}>
                      <Mail aria-hidden="true" className="size-3.5" /> {site.email.address}
                    </a>
                  )}
                </div>
                {site.socials.length > 0 && (
                  <ul className="flex items-center gap-4">
                    {site.socials.map((social) => (
                      <li key={social.platform + social.href}>
                        <a
                          className="hover:text-white/80"
                          href={social.href}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {social.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <div
          className={`backdrop-blur transition-[background-color,box-shadow] duration-300 ${
            scrolled ? 'bg-white/90 shadow-[0_4px_20px_rgba(28,36,75,.1)]' : 'bg-surface-alt/85'
          }`}
        >
          <div
            className={`mx-auto flex h-16 max-w-site items-center gap-4 px-4 transition-[height] duration-300 ${
              scrolled ? '' : 'md:h-[72px]'
            }`}
          >
            <Link aria-label={`${site.businessName} home`} className="shrink-0" href="/">
              <Logo
                className="h-11 w-auto"
                fallback={LOGO_FALLBACK}
                image={site.logo}
                name={site.businessName}
                priority
                sizes="64px"
              />
            </Link>

            {showNav && hasNavItems ? (
              <nav aria-label="Main" className="hidden h-full flex-1 items-center justify-center gap-7 lg:flex">
                {header.groups.length > 0 && (
                  <MegaMenu active={pathname.startsWith('/services')} groups={header.groups} />
                )}
                {header.links.map((link) => (
                  <SmartLink
                    aria-current={link.kind === 'internal' && isActive(pathname, link.href) ? 'page' : undefined}
                    className={`text-[17px] font-medium transition-colors hover:text-brand-active focus-visible:text-brand-active ${
                      link.kind === 'internal' && isActive(pathname, link.href) ? 'text-brand-active' : 'text-navy'
                    }`}
                    key={`${link.label}-${link.href}`}
                    link={link}
                    newTab={link.newTab}
                  >
                    {link.label}
                  </SmartLink>
                ))}
              </nav>
            ) : (
              <div className="flex-1" />
            )}

            {header.cta && (
              <SmartLink
                className="shrink-0 rounded-full bg-brand px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-active focus-visible:bg-brand-active md:px-6 md:text-base"
                link={header.cta.link}
              >
                {header.cta.label}
              </SmartLink>
            )}

            {hasNavItems && (
              <button
                aria-controls="mobile-menu"
                aria-expanded={menuOpen}
                aria-haspopup="dialog"
                aria-label="Open menu"
                className={`size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-navy text-navy hover:bg-navy hover:text-white focus-visible:bg-navy focus-visible:text-white ${
                  showNav ? 'flex lg:hidden' : 'flex'
                }`}
                onClick={() => setMenuPath(pathname)}
                ref={hamburger}
                type="button"
              >
                <Menu aria-hidden="true" className="size-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <MobileMenu
        header={header}
        onClose={closeMenu}
        open={menuOpen}
        returnFocus={hamburger}
        site={site}
      />
    </>
  )
}
