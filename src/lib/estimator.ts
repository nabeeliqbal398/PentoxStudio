// Cost-estimator maths. Pure and server-side: price rules are admin-only in the CMS, so the browser
// only ever receives the result. Nothing here invents a price: without a base price in the rule
// the result is { priced: false } and the UI says "contact us".

export type EstimatorRule = {
  basePrice?: number | null
  currency?: string | null
  scopeOptions?: { label: string; description?: string | null; priceAdd?: number | null }[] | null
  timelineOptions?: { label: string; multiplier?: number | null }[] | null
  rangeSpreadPercent?: number | null
}

export type EstimateLine = { label: string; amount: number }

export type Estimate =
  | { priced: false }
  | {
      priced: true
      currency: string
      lines: EstimateLine[]
      subtotal: number
      timeline?: { label: string; multiplier: number }
      total: number
      min: number
      max: number
    }

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

export function computeEstimate(
  rule: EstimatorRule,
  scopeLabels: string[],
  timelineLabel?: string | null,
): Estimate {
  if (!isNumber(rule.basePrice) || rule.basePrice <= 0) return { priced: false }

  const lines: EstimateLine[] = [{ label: 'base', amount: rule.basePrice }]
  const wanted = new Set(scopeLabels)
  for (const option of rule.scopeOptions ?? []) {
    if (wanted.has(option.label) && isNumber(option.priceAdd) && option.priceAdd !== 0) {
      lines.push({ label: option.label, amount: option.priceAdd })
    }
  }
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0)

  const timelineOption = (rule.timelineOptions ?? []).find((option) => option.label === timelineLabel)
  const multiplier = timelineOption && isNumber(timelineOption.multiplier) && timelineOption.multiplier > 0 ? timelineOption.multiplier : 1
  const total = Math.round(subtotal * multiplier)

  const spread = isNumber(rule.rangeSpreadPercent) ? Math.min(Math.max(rule.rangeSpreadPercent, 0), 100) : 0
  return {
    priced: true,
    currency: rule.currency ?? '',
    lines,
    subtotal,
    timeline: timelineOption && multiplier !== 1 ? { label: timelineOption.label, multiplier } : undefined,
    total,
    min: Math.round(total * (1 - spread / 100)),
    max: Math.round(total * (1 + spread / 100)),
  }
}

export const formatMoney = (amount: number, currency?: string | null) =>
  [currency, amount.toLocaleString('en-US')].filter(Boolean).join(' ')

export const formatRange = (estimate: Extract<Estimate, { priced: true }>) =>
  estimate.min === estimate.max
    ? formatMoney(estimate.total, estimate.currency)
    : `${formatMoney(estimate.min, estimate.currency)} – ${formatMoney(estimate.max, estimate.currency).replace(`${estimate.currency} `, '')}`
