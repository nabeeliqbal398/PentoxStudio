import { Clock, Mail, MapPin, MessageCircle, Phone, Share2 } from 'lucide-react'
import type { ReactNode } from 'react'

import type { SiteInfo } from '@/lib/site-data'
import type { SiteText } from '@/payload-types'

type Labels = NonNullable<SiteText['contact']>

function Row({ icon, label, children }: { icon: ReactNode; label?: string | null; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 text-brand">{icon}</span>
      <div>
        {label && <p className="text-sm font-semibold text-navy">{label}</p>}
        <div className="text-body">{children}</div>
      </div>
    </li>
  )
}

/** NAP, hours, response time and socials from Site settings. Every row is hidden when its value is empty. */
export function ContactDetails({ site, labels }: { site: SiteInfo; labels?: Labels | null }) {
  const icon = 'size-5'
  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(28,36,75,.08)] md:p-8">
      {labels?.details && <h2 className="mb-5 font-heading text-2xl font-semibold text-navy">{labels.details}</h2>}
      <ul className="space-y-5">
        {site.phone && (
          <Row icon={<Phone aria-hidden="true" className={icon} />} label={labels?.phone}>
            <a className="hover:text-brand" href={site.phone.href}>
              {site.phone.display}
            </a>
          </Row>
        )}
        {site.whatsapp && (
          <Row icon={<MessageCircle aria-hidden="true" className={icon} />} label={labels?.whatsapp}>
            <a className="hover:text-brand" href={site.whatsapp.href} rel="noopener noreferrer" target="_blank">
              +{site.whatsapp.number}
            </a>
          </Row>
        )}
        {site.email && (
          <Row icon={<Mail aria-hidden="true" className={icon} />} label={labels?.email}>
            <a className="break-all hover:text-brand" href={site.email.href}>
              {site.email.address}
            </a>
          </Row>
        )}
        {site.addressLines.length > 0 && (
          <Row icon={<MapPin aria-hidden="true" className={icon} />} label={labels?.address}>
            <address className="not-italic">
              {site.addressLines.map((line) => (
                <span className="block" key={line}>
                  {line}
                </span>
              ))}
            </address>
          </Row>
        )}
        {(site.hours.length > 0 || site.responseTime) && (
          <Row icon={<Clock aria-hidden="true" className={icon} />} label={labels?.hours}>
            {site.hours.map((row) => (
              <span className="block" key={row}>
                {row}
              </span>
            ))}
            {site.responseTime && <span className="block">{site.responseTime}</span>}
          </Row>
        )}
        {site.socials.length > 0 && (
          <Row icon={<Share2 aria-hidden="true" className={icon} />} label={labels?.follow}>
            <span className="flex flex-wrap gap-x-4 gap-y-1">
              {site.socials.map((social) => (
                <a
                  className="hover:text-brand"
                  href={social.href}
                  key={social.platform + social.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {social.label}
                </a>
              ))}
            </span>
          </Row>
        )}
      </ul>
    </div>
  )
}
