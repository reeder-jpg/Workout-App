import { useLayoutEffect, useRef, useState } from 'react'

interface Props {
  text: string
  lines?: number
  className?: string
}

/**
 * Long text clamped to a few lines with a More / Less toggle. The toggle only
 * appears when the text actually overflows, so short text reads as plain text.
 */
export function ClampText({ text, lines = 3, className }: Props) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [open, setOpen] = useState(false)
  const [overflows, setOverflows] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || open) return
    const check = () => setOverflows(el.scrollHeight - el.clientHeight > 2)
    check()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [text, lines, open])

  return (
    <div className="clamp">
      <p
        ref={ref}
        className={`clamp-text${className ? ` ${className}` : ''}`}
        style={open ? undefined : { WebkitLineClamp: lines }}
        data-open={open || undefined}
      >
        {text}
      </p>
      {(overflows || open) && (
        <button type="button" className="clamp-toggle" onClick={() => setOpen((o) => !o)}>
          {open ? 'Less' : 'More'}
        </button>
      )}
    </div>
  )
}
