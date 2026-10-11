import { LinkJSXConverter, RichText as LexicalRichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { collectionPaths } from '@/lib/paths'

import { Cta } from './Cta'

const YOUTUBE_ID = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/

const TONES = {
  info: 'border-accent bg-accent/5',
  tip: 'border-emerald-600 bg-emerald-50',
  warning: 'border-brand bg-brand/5',
} as const

type BlockProps = { node: { fields: unknown } }

type BlockFields = Record<string, unknown> & { blockType: string }

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({
    internalDocToHref: ({ linkNode }) => {
      const { relationTo, value } = linkNode.fields.doc ?? {}
      const doc = typeof value === 'object' ? (value as { slug?: string; path?: string }) : undefined
      return (relationTo && collectionPaths[relationTo]?.(doc)) || '/'
    },
  }),
  blocks: {
    callout: ({ node }: BlockProps) => {
      const f = node.fields as BlockFields & { tone: keyof typeof TONES; title?: string; body: string }
      return (
        <aside className={`my-6 rounded-lg border-l-4 p-4 ${TONES[f.tone] ?? TONES.info}`}>
          {f.title && <p className="font-heading font-semibold text-navy">{f.title}</p>}
          <p className="m-0">{f.body}</p>
        </aside>
      )
    },
    cta: ({ node }: BlockProps) => {
      const f = node.fields as BlockFields & { heading: string; text?: string; buttonLabel: string; buttonUrl: string }
      return (
        <aside className="my-8 rounded-2xl bg-navy p-6 text-center text-white not-prose">
          <p className="font-heading text-xl font-semibold">{f.heading}</p>
          {f.text && <p className="mx-auto mt-2 max-w-xl text-white/80">{f.text}</p>}
          <div className="mt-4">
            <Cta label={f.buttonLabel} url={f.buttonUrl} />
          </div>
        </aside>
      )
    },
    faq: ({ node }: BlockProps) => {
      const f = node.fields as BlockFields & { heading?: string; items: { question: string; answer: string }[] }
      return (
        <section className="my-8">
          {f.heading && <h2>{f.heading}</h2>}
          {f.items.map((item) => (
            <details className="border-b border-line/40 py-3" key={item.question}>
              <summary className="cursor-pointer font-semibold text-navy">{item.question}</summary>
              <p className="mt-2">{item.answer}</p>
            </details>
          ))}
        </section>
      )
    },
    youtube: ({ node }: BlockProps) => {
      const f = node.fields as BlockFields & { url: string; title?: string }
      const id = YOUTUBE_ID.exec(f.url)?.[1]
      if (!id) return null
      return (
        <div className="my-6 aspect-video overflow-hidden rounded-xl">
          <iframe
            allowFullScreen
            className="size-full"
            loading="lazy"
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={f.title || 'YouTube video'}
          />
        </div>
      )
    },
  },
})


/** Renders Lexical rich text (legal text, About story, long-form service copy). */
export function RichText({ data, className = '' }: { data?: DefaultTypedEditorState | null; className?: string }) {
  if (!data?.root?.children?.length) return null
  return (
    <LexicalRichText
      className={`prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-navy prose-a:text-accent ${className}`}
      converters={converters}
      data={data}
    />
  )
}
