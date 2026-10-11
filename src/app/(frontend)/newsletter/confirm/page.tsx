import type { Metadata } from 'next'
import Link from 'next/link'

import { TokenButton } from '@/components/newsletter/TokenButton'
import { Section } from '@/components/ui/Section'
import { getNewsletterText } from '@/lib/newsletter/settings'
import { verifyToken } from '@/lib/newsletter/tokens'

// Reached from the link in the confirmation email. noindex: these are personal, token-bearing pages.
export const metadata: Metadata = { title: 'Confirm subscription', robots: { index: false, follow: false } }

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function ConfirmPage({ searchParams }: Props) {
  const raw = (await searchParams).token
  const token = (Array.isArray(raw) ? raw[0] : raw) ?? ''
  const page = (await getNewsletterText()).confirmPage
  // A bad or expired link is reported straight away; a good one shows the confirm button.
  const valid = verifyToken(token, 'c') !== null

  return (
    <Section className="max-w-xl text-center">
      {valid ? (
        <>
          {page?.title && <h1 className="font-heading text-3xl font-semibold text-navy">{page.title}</h1>}
          {page?.intro && <p className="mb-8 mt-3 text-body">{page.intro}</p>}
          <TokenButton
            button={page?.button}
            done={{ title: page?.doneTitle, text: page?.doneText }}
            homeLink={page?.homeLink}
            invalid={{ title: page?.invalidTitle, text: page?.invalidText }}
            kind="confirm"
            token={token}
          />
        </>
      ) : (
        <>
          {page?.invalidTitle && <h1 className="font-heading text-3xl font-semibold text-navy">{page.invalidTitle}</h1>}
          {page?.invalidText && <p className="mt-3 text-body">{page.invalidText}</p>}
          {page?.homeLink && (
            <p className="mt-6">
              <Link className="font-semibold text-accent underline underline-offset-4" href="/">
                {page.homeLink}
              </Link>
            </p>
          )}
        </>
      )}
    </Section>
  )
}
