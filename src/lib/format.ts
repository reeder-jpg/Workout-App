export function fmtWeight(w: number): string {
  if (!w) return '0'
  return Number.isInteger(w) ? String(w) : w.toFixed(1)
}

export function fmtNum(n: number): string {
  return Math.round(n).toLocaleString()
}

export function relativeDate(ts: number, now = Date.now()): string {
  const diff = now - ts
  const day = 24 * 60 * 60 * 1000
  const days = Math.floor(diff / day)
  if (days <= 0) {
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    return ts >= startOfToday.getTime() ? 'Today' : 'Yesterday'
  }
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function fmtDuration(sec?: number): string {
  if (!sec) return '—'
  const m = Math.round(sec / 60)
  if (m < 60) return `${m}m`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

/**
 * Session names are stored as "Plan name · Day name". Screens lead with the
 * day (what you trained) and show the plan as context. Names without the
 * separator (empty workouts, imports) come back whole as the title.
 */
export function splitSessionName(name: string): { title: string; context?: string } {
  const i = name.indexOf(' · ')
  if (i <= 0) return { title: name }
  const context = name.slice(0, i).trim()
  const title = name.slice(i + 3).trim()
  return title ? { title, context: context || undefined } : { title: name }
}
