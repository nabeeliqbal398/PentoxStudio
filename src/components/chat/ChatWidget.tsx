'use client'

import { MessageCircle, RotateCcw, Send, X } from 'lucide-react'
import { Fragment, useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'

import { blocks, type Piece } from '@/lib/chatbot/format'
import type { ChatWidgetConfig } from '@/lib/chatbot/public'
import { trackEvent } from '@/lib/track'

type Message = { id: number; role: 'user' | 'assistant'; text: string; lead?: boolean }
type Fallback = 'busy' | 'cap' | 'rate' | 'limit' | 'error' | 'disabled'

const SESSION_KEY = 'pentox_chat_session'
const MESSAGES_KEY = 'pentox_chat_messages'
const MAX_LENGTH = 800

const storage = {
  get(key: string) {
    try {
      return window.sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string | null) {
    try {
      if (value === null) window.sessionStorage.removeItem(key)
      else window.sessionStorage.setItem(key, value)
    } catch {
      // storage blocked: the chat still works for this page view
    }
  },
}

function Inline({ pieces }: { pieces: Piece[] }) {
  return (
    <>
      {pieces.map((piece, i) =>
        piece.type === 'bold' ? (
          <strong key={i}>{piece.text}</strong>
        ) : piece.type === 'link' ? (
          <a
            className="font-medium text-accent underline underline-offset-2"
            href={piece.href}
            key={i}
            {...(piece.href?.startsWith('http') ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
          >
            {piece.text}
          </a>
        ) : (
          <span key={i}>{piece.text}</span>
        ),
      )}
    </>
  )
}

function Bubble({ message }: { message: Message }) {
  const mine = message.role === 'user'
  return (
    <li className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] space-y-2 rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          mine ? 'rounded-br-sm bg-navy text-white' : 'rounded-bl-sm bg-surface-alt text-body'
        }`}
      >
        {mine ? (
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        ) : (
          blocks(message.text).map((block, i) =>
            block.kind === 'p' ? (
              <p className="break-words" key={i}>
                <Inline pieces={block.pieces} />
              </p>
            ) : (
              <ul className="list-disc space-y-1 pl-5" key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Inline pieces={item} />
                  </li>
                ))}
              </ul>
            ),
          )
        )}
      </div>
    </li>
  )
}

/**
 * Floating AI chat widget. Keyboard friendly (focus moves into the window when it opens and back to the button
 * when it closes; Esc closes; Tab stays inside), announces replies to screen readers through a polite live region,
 * and sits above the mobile sticky bar. Wording comes from the CMS; the Groq key never reaches the browser.
 */
export function ChatWidget({
  config,
  whatsappHref,
  hasStickyBar,
}: {
  config: ChatWidgetConfig
  whatsappHref?: string
  hasStickyBar: boolean
}) {
  const { text } = config
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [fallback, setFallback] = useState<Fallback | null>(null)
  const [announce, setAnnounce] = useState('')
  const panel = useRef<HTMLDivElement>(null)
  const launcher = useRef<HTMLButtonElement>(null)
  const field = useRef<HTMLTextAreaElement>(null)
  const list = useRef<HTMLOListElement>(null)
  const nextId = useRef(1)
  const wasOpen = useRef(false)

  // Restore this tab's conversation after the widget mounts (sessionStorage is not available during the server render).
  useEffect(() => {
    const raw = storage.get(MESSAGES_KEY)
    if (!raw) return
    try {
      const saved = JSON.parse(raw) as Message[]
      const restored = Array.isArray(saved) ? saved.slice(-40) : []
      nextId.current = restored.reduce((max, item) => Math.max(max, item.id), 0) + 1
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages(restored)
    } catch {
      storage.set(MESSAGES_KEY, null)
    }
  }, [])

  // Focus management: into the window on open, back to the launcher on close.
  useEffect(() => {
    if (open) field.current?.focus()
    else if (wasOpen.current) launcher.current?.focus()
    wasOpen.current = open
  }, [open])

  // Esc closes the window from anywhere (focus can be on the page if the button that had it disappeared).
  useEffect(() => {
    if (!open) return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Keep the newest message in view.
  useEffect(() => {
    list.current?.lastElementChild?.scrollIntoView({ block: 'end' })
  }, [messages, fallback, open])

  const remember = (next: Message[]) => storage.set(MESSAGES_KEY, JSON.stringify(next.slice(-40)))

  const send = useCallback(
    async (raw: string) => {
      const message = raw.trim().slice(0, MAX_LENGTH)
      if (!message || busy) return
      setInput('')
      setFallback(null)
      setBusy(true)
      setAnnounce(text.thinking)

      const userMessage: Message = { id: nextId.current++, role: 'user', text: message }
      const reply: Message = { id: nextId.current++, role: 'assistant', text: '' }
      let current = [...messages, userMessage]
      setMessages([...current, reply])

      let answer = ''
      let failed: Fallback | null = null
      try {
        const response = await fetch('/api/chat/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: storage.get(SESSION_KEY) ?? undefined, message, pageUrl: window.location.pathname }),
        })
        if (!response.ok || !response.body) throw new Error('bad response')
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        for (;;) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          let newline: number
          while ((newline = buffer.indexOf('\n')) >= 0) {
            const raw = buffer.slice(0, newline).trim()
            buffer = buffer.slice(newline + 1)
            if (!raw) continue
            const event = JSON.parse(raw) as { type: string; text?: string; sessionId?: string; reason?: Fallback }
            if (event.type === 'session' && event.sessionId) storage.set(SESSION_KEY, event.sessionId)
            else if (event.type === 'token' || event.type === 'refusal') {
              answer += event.text ?? ''
              setMessages([...current, { ...reply, text: answer }])
            } else if (event.type === 'lead') {
              reply.lead = true
              // chat_lead conversion event (only fires after the visitor accepted cookies).
              trackEvent('chat_lead', { source: 'chatbot' })
            } else if (event.type === 'fallback') failed = event.reason ?? 'error'
          }
        }
      } catch {
        failed = 'error'
      }

      current = [...current, { ...reply, text: answer }].filter((item) => item.role === 'user' || item.text || item.lead)
      setMessages(current)
      remember(current)
      setFallback(failed)
      setBusy(false)
      setAnnounce(failed ? text.errorText : answer)
    },
    [busy, messages, text.errorText, text.thinking],
  )

  const reset = () => {
    storage.set(SESSION_KEY, null)
    storage.set(MESSAGES_KEY, null)
    setMessages([])
    setFallback(null)
    setAnnounce('')
    field.current?.focus()
  }

  const onPanelKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !panel.current) return
    // Keep Tab inside the open window.
    const focusable = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea:not([disabled])')
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const launcherPosition = hasStickyBar ? 'bottom-[4.5rem]' : 'bottom-4'
  const panelPosition = hasStickyBar ? 'bottom-[4.25rem]' : 'bottom-2'

  return (
    <>
      <button
        aria-controls="chat-panel"
        aria-expanded={open}
        aria-label={text.launcherLabel}
        className={`fixed right-4 z-40 flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform hover:scale-105 focus-visible:scale-105 md:bottom-6 md:right-6 ${launcherPosition} ${open ? 'hidden md:flex' : ''}`}
        onClick={() => setOpen((value) => !value)}
        ref={launcher}
        type="button"
      >
        <MessageCircle aria-hidden="true" className="size-7" />
      </button>

      <div
        aria-label={text.title}
        className={`fixed inset-x-2 z-50 flex h-[min(75dvh,34rem)] flex-col overflow-hidden rounded-2xl border border-line/40 bg-white shadow-soft md:inset-x-auto md:bottom-24 md:right-6 md:h-[34rem] md:w-[24rem] ${panelPosition} ${open ? '' : 'hidden'}`}
        id="chat-panel"
        onKeyDown={onPanelKey}
        ref={panel}
        role="dialog"
      >
        <div className="flex items-center justify-between bg-navy px-4 py-3 text-white">
          <p className="font-heading text-base font-semibold">{text.title}</p>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                aria-label={text.newChat}
                className="rounded-full p-1.5 hover:bg-white/15"
                disabled={busy}
                onClick={reset}
                title={text.newChat}
                type="button"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
              </button>
            )}
            <button aria-label={text.close} className="rounded-full p-1.5 hover:bg-white/15" onClick={() => setOpen(false)} type="button">
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>

        <ol aria-busy={busy} className="flex-1 space-y-3 overflow-y-auto px-3 py-4" ref={list}>
          {config.greeting && (
            <Bubble message={{ id: 0, role: 'assistant', text: config.greeting }} />
          )}
          {messages.length === 0 && config.suggestions.length > 0 && (
            <li className="flex flex-wrap gap-2 pt-1">
              {config.suggestions.map((suggestion) => (
                <button
                  className="rounded-full border border-navy/30 px-3 py-1.5 text-left text-xs text-navy hover:bg-navy hover:text-white"
                  key={suggestion}
                  onClick={() => void send(suggestion)}
                  type="button"
                >
                  {suggestion}
                </button>
              ))}
            </li>
          )}
          {messages.map((message) => (
            <Fragment key={message.id}>
              {(message.role === 'user' || message.text) && <Bubble message={message} />}
              {message.lead && text.leadSaved && (
                <li className="text-center text-xs font-medium text-emerald-700">{text.leadSaved}</li>
              )}
            </Fragment>
          ))}
          {busy && messages[messages.length - 1]?.text === '' && <li className="text-xs text-muted">{text.thinking}</li>}
          {fallback && (
            <li className="space-y-2 rounded-xl bg-brand/10 p-3 text-sm text-body">
              <p>{config.fallbackText || text.errorText}</p>
              {whatsappHref && (
                <a
                  className="inline-flex rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
                  href={whatsappHref}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {text.whatsappButton}
                </a>
              )}
            </li>
          )}
        </ol>

        {/* Screen readers: "replying…" while waiting, then the finished reply (not every streamed word). */}
        <p aria-live="polite" className="sr-only" role="status">
          {announce}
        </p>

        <form
          className="border-t border-line/40 p-3"
          onSubmit={(event) => {
            event.preventDefault()
            void send(input)
          }}
        >
          <div className="flex items-end gap-2">
            <label className="sr-only" htmlFor="chat-input">
              {text.placeholder}
            </label>
            <textarea
              className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-line/60 bg-form-bg px-4 py-2.5 text-sm text-body placeholder:text-muted focus:border-navy focus:outline-none"
              disabled={busy}
              id="chat-input"
              maxLength={MAX_LENGTH}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void send(input)
                }
              }}
              placeholder={text.placeholder}
              ref={field}
              rows={1}
              value={input}
            />
            <button
              aria-label={text.send}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-active disabled:opacity-50"
              disabled={busy || !input.trim()}
              type="submit"
            >
              <Send aria-hidden="true" className="size-5" />
            </button>
          </div>
          {text.privacyNote && <p className="mt-2 text-[11px] leading-snug text-muted">{text.privacyNote}</p>}
        </form>
      </div>
    </>
  )
}
