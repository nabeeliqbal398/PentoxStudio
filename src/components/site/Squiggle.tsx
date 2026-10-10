// Zig-zag divider used under page heroes and between major sections (capture/06 §3).
export function Squiggle({ className = '' }: { className?: string }) {
  const points = Array.from({ length: 21 }, (_, i) => `${i * 10},${i % 2 === 0 ? 2 : 10}`).join(' ')
  return (
    <svg
      aria-hidden="true"
      className={`mx-auto block h-3 w-[200px] text-brand/60 ${className}`}
      fill="none"
      focusable="false"
      viewBox="0 0 200 12"
    >
      <polyline
        points={points}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}
