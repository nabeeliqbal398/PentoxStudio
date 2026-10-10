'use client'

import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import type { MenuGroup } from '@/lib/site-data'

/**
 * Desktop "Services" trigger + grouped panel. Opens on hover, click or keyboard; closes on
 * Escape, outside click, focus leaving, or navigation. Groups arrive already filtered to
 * published services, so every link here resolves.
 */
export function MegaMenu({ groups, active }: { groups: MenuGroup[]; active: boolean }) {
  const pathname = usePathname()
  // Open state is tied to the pathname it was opened on, so navigating closes it without an effect.
  const [openPath, setOpenPath] = useState<string | null>(null)
  const open = openPath === pathname
  const wrapper = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpenPath(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div
      className="relative flex h-full items-center"
      onBlur={(event) => {
        if (!wrapper.current?.contains(event.relatedTarget as Node | null)) setOpenPath(null)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpenPath(null)
          trigger.current?.focus()
        }
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setOpenPath(pathname)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setOpenPath(null)
      }}
      ref={wrapper}
    >
      <button
        aria-controls="mega-menu"
        aria-expanded={open}
        className={`flex items-center gap-1 py-2 text-[17px] font-medium transition-colors hover:text-brand-active focus-visible:text-brand-active ${
          active ? 'text-brand-active' : 'text-navy'
        }`}
        onClick={() => setOpenPath(open ? null : pathname)}
        ref={trigger}
        type="button"
      >
        Services
        <ChevronDown
          aria-hidden="true"
          className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="absolute left-1/2 top-full z-10 w-[min(64rem,92vw)] -translate-x-1/2 rounded-xl border border-line/30 bg-white p-6 shadow-soft"
          id="mega-menu"
        >
          <div
            className="grid gap-8"
            style={{ gridTemplateColumns: `repeat(${Math.min(groups.length, 3)}, minmax(0, 1fr))` }}
          >
            {groups.map((group) => (
              <div key={group.label}>
                <p className="mb-3 border-b border-brand/40 pb-2 font-heading text-sm font-semibold uppercase tracking-wide text-brand">
                  {group.label}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        className={`block rounded-lg px-3 py-2 transition-colors hover:bg-surface-alt focus-visible:bg-surface-alt ${
                          item.isChild ? 'ml-4 border-l border-line/50' : ''
                        }`}
                        href={item.href}
                      >
                        <span
                          className={`block font-medium text-navy ${item.isChild ? 'text-sm' : 'text-[15px]'}`}
                        >
                          {item.title}
                        </span>
                        {item.description && (
                          <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-muted">
                            {item.description}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-line/30 pt-4 text-right">
            <Link className="text-sm font-medium text-accent hover:underline" href="/services/">
              View all services →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
