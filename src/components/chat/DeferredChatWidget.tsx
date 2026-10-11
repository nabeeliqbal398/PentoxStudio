'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, type ComponentProps } from 'react'

// The chat button is not needed to read the page, so its code (React state, icons, streaming parser) is only
// downloaded and run shortly after the page has finished loading. Keeps it out of the first hydration.
const ChatWidget = dynamic(() => import('./ChatWidget').then((module) => module.ChatWidget), { ssr: false })

export function DeferredChatWidget(props: ComponentProps<typeof ChatWidget>) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const start = () => {
      timer = setTimeout(() => setReady(true), 1500)
    }
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    return () => {
      window.removeEventListener('load', start)
      clearTimeout(timer)
    }
  }, [])

  return ready ? <ChatWidget {...props} /> : null
}
