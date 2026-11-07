import { useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { Button } from '../../components/ui/button'

interface Props<T> {
  items: T[]
  getKey: (item: T) => string
  onChange: (items: T[]) => void
  render: (item: T, index: number) => ReactNode
}

function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/**
 * Drag the handle to reorder, with mouse or finger (pointer events, so it also
 * works on phones). The arrow buttons do the same for keyboard users.
 */
export function SortableList<T>({ items, getKey, onChange, render }: Props<T>) {
  const rows = useRef<(HTMLLIElement | null)[]>([])
  const [dragging, setDragging] = useState<number | null>(null)

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>, index: number) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(index)
  }

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragging === null) return
    // Find the row whose middle the pointer has passed.
    let target = dragging
    rows.current.forEach((row, index) => {
      if (!row || index === dragging) return
      const box = row.getBoundingClientRect()
      const middle = box.top + box.height / 2
      if (index < dragging && event.clientY < middle) target = Math.min(target, index)
      if (index > dragging && event.clientY > middle) target = Math.max(target, index)
    })
    if (target !== dragging) {
      onChange(move(items, dragging, target))
      setDragging(target)
    }
  }

  const onPointerUp = () => setDragging(null)

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={getKey(item)}
          ref={(element) => { rows.current[index] = element }}
          className={`flex items-center gap-2 rounded-lg border bg-card p-2 transition-shadow ${
            dragging === index ? 'border-accent shadow-lg' : 'border-border'
          }`}
        >
          <button
            type="button"
            aria-label="Drag to reorder"
            className="flex h-10 w-8 flex-shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-secondary active:cursor-grabbing"
            onPointerDown={(event) => onPointerDown(event, index)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">{render(item, index)}</div>
          <div className="flex flex-col">
            <Button
              type="button" variant="ghost" size="icon" className="h-7 w-7"
              aria-label="Move up" disabled={index === 0}
              onClick={() => onChange(move(items, index, index - 1))}
            >
              <ChevronUp />
            </Button>
            <Button
              type="button" variant="ghost" size="icon" className="h-7 w-7"
              aria-label="Move down" disabled={index === items.length - 1}
              onClick={() => onChange(move(items, index, index + 1))}
            >
              <ChevronDown />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
