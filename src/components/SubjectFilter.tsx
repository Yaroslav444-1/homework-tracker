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

// На телефоне — «чипсы» в строку, на ПК (lg+) — вертикальное меню в сайдбаре.
function chipClass(active: boolean): string {
  return (
    'relative inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ' +
    'lg:w-full lg:rounded-xl lg:px-3 lg:py-2.5 ' +
    (active
      ? 'border-transparent text-white dark:text-slate-900'
      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 ' +
        'lg:border-transparent lg:bg-transparent lg:hover:bg-slate-100 lg:dark:border-transparent lg:dark:bg-transparent lg:dark:hover:bg-slate-800')
  )
}

function Chip({ active, onClick, dot, label, count }: { active: boolean; onClick: () => void; dot?: string; label: string; count: number }) {
  return (
    <button type="button" className={chipClass(active)} onClick={onClick}>
      {active && (
        <motion.span
          layoutId="active-subject"
          className="absolute inset-0 rounded-full bg-slate-900 lg:rounded-xl dark:bg-white"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
        />
      )}
      <span className="relative flex min-w-0 flex-1 items-center gap-2">
        {dot && <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />}
        <span className="truncate">{label}</span>
        <motion.span
          key={count}
          initial={{ scale: 1.4 }}
          animate={{ scale: 1 }}
          className={
            'min-w-5 rounded-full px-1.5 text-center text-xs tabular-nums lg:ml-auto ' +
            (active ? 'bg-white/20 dark:bg-slate-900/15' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400')
          }
        >
          {count}
        </motion.span>
      </span>
    </button>
  )
}

export function SubjectFilter({ subjects, activeCounts, totalActive, selected, onSelect, onManage }: Props) {
  return (
    <nav className="lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-3 lg:dark:border-slate-800 lg:dark:bg-slate-900">
      <h2 className="hidden px-3 pt-1 pb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase lg:block">Предметы</h2>
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
        <button
          type="button"
          onClick={onManage}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 lg:mt-2 lg:justify-center lg:rounded-xl lg:py-2.5 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
        >
          <Settings2 className="h-4 w-4" />
          Управлять предметами
        </button>
      </div>
    </nav>
  )
}
