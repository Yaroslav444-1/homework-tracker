import { motion } from 'motion/react'
import { Settings2 } from 'lucide-react'
import { COLORS } from '../lib/constants'
import type { Subject } from '../lib/types'

interface Props {
  subjects: Subject[]
  activeCounts: Record<string, number>
  totalActive: number
  selected: string
  onSelect: (id: string) => void
  onManage: () => void
}

// На телефоне — стеклянные «пилюли» в строку, на ПК (lg+) — вертикальное меню в сайдбаре.
function chipClass(active: boolean): string {
  return (
    'caption relative inline-flex items-center rounded-full border px-4 py-2 transition-colors ' +
    'lg:w-full lg:px-4 lg:py-2.5 ' +
    (active
      ? 'border-transparent text-white'
      : 'glass border-line text-ink/85 hover:border-line-strong hover:text-ink lg:border-transparent lg:bg-transparent lg:backdrop-blur-none lg:hover:bg-surface-2')
  )
}

function Chip({ active, onClick, dot, label, count }: { active: boolean; onClick: () => void; dot?: string; label: string; count: number }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.94 }} className={chipClass(active)} onClick={onClick}>
      {active && (
        <motion.span
          layoutId="active-subject"
          className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 shadow-[0_6px_22px_-6px_rgb(93_47_255/0.85)]"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
        />
      )}
      <span className="relative flex min-w-0 flex-1 items-center gap-2">
        {dot && <span className={`h-2 w-2 shrink-0 rounded-full ring-2 ring-white/20 ${dot}`} />}
        <span className="truncate">{label}</span>
        <motion.span
          key={count}
          initial={{ scale: 1.4 }}
          animate={{ scale: 1 }}
          className={
            'min-w-5 rounded-full px-1.5 text-center tabular-nums lg:ml-auto ' +
            (active ? 'bg-white/20 text-white' : 'bg-surface-2 text-muted')
          }
        >
          {count}
        </motion.span>
      </span>
    </motion.button>
  )
}

export function SubjectFilter({ subjects, activeCounts, totalActive, selected, onSelect, onManage }: Props) {
  return (
    <nav className="lg:glass lg:rounded-[2rem] lg:border lg:border-line lg:p-3">
      <h2 className="caption hidden px-4 pt-2 pb-3 text-muted lg:block">Предметы</h2>
      <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch lg:gap-1">
        <Chip active={selected === 'all'} onClick={() => onSelect('all')} label="Все предметы" count={totalActive} />
        {subjects.map((s) => (
          <Chip
            key={s.id}
            active={selected === s.id}
            onClick={() => onSelect(s.id)}
            dot={COLORS[s.color].dot}
            label={s.name}
            count={activeCounts[s.id] ?? 0}
          />
        ))}
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={onManage}
          className="caption inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-strong px-4 py-2 text-muted transition hover:border-brand-500 hover:text-brand-600 lg:mt-2 lg:justify-center lg:py-2.5 dark:hover:text-brand-300"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Управлять предметами
        </motion.button>
      </div>
    </nav>
  )
}
