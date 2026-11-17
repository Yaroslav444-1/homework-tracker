import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown } from 'lucide-react'
import { inputClass } from '../lib/ui'

export interface SelectOption<T extends string> {
  value: T
  label: string
  /** Класс цветной точки (для предметов) */
  dot?: string
}

interface Props<T extends string> {
  id: string
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
}

/**
 * Выпадающий список с анимацией открытия. Нативный <select> анимировать нельзя,
 * поэтому это кнопка + список с ролями listbox/option и управлением с клавиатуры.
 */
export function Select<T extends string>({ id, value, options, onChange }: Props<T>) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  // Закрываем по клику вне списка
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const openList = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)))
    setOpen(true)
  }

  const choose = (v: T) => {
    onChange(v)
    setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        openList()
      }
      return
    }
    if (e.key === 'Escape' || e.key === 'Tab') {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation() // не закрывать модальное окно
      }
      setOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(options.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      choose(options[active].value)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`${inputClass} flex items-center gap-2 text-left`}
      >
        {selected?.dot && <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${selected.dot}`} />}
        <span className="flex-1 truncate">{selected?.label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-muted">
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={`${id}-list`}
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{ transformOrigin: 'top' }}
            className="absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-line bg-elevated p-1.5 shadow-2xl shadow-black/30 backdrop-blur-xl"
          >
            {options.map((o, i) => {
              const isSelected = o.value === value
              return (
                <li
                  key={o.value}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => choose(o.value)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    i === active ? 'bg-brand-500/15 text-ink' : 'text-ink/85'
                  }`}
                >
                  {o.dot && <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${o.dot}`} />}
                  <span className="flex-1">{o.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-brand-500 dark:text-brand-400" />}
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
