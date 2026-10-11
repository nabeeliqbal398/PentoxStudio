import { CircleCheck, icons, type LucideIcon } from 'lucide-react'

const pascal = (name: string) =>
  name
    .trim()
    .split(/[\s_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

/** Renders a lucide icon chosen by name in the CMS ("Target", "chart-line"); unknown names get a tick. */
export function CmsIcon({ name, className = 'size-6' }: { name?: string | null; className?: string }) {
  const Icon: LucideIcon = (name ? (icons as Record<string, LucideIcon>)[pascal(name)] : undefined) ?? CircleCheck
  return <Icon aria-hidden="true" className={className} />
}
