import type { Ref } from 'react'
import { motion } from 'motion/react'
import { CalendarDays, Check, Pencil, Trash } from 'lucide-react'
import { COLORS, TASK_TYPES } from '../lib/constants'
import { deadlineInfo, formatDue, type Urgency } from '../lib/deadline'
import { iconBtn } from '../lib/ui'
import type { Subject, Task } from '../lib/types'

interface Props {
  task: Task
  subject: Subject | undefined
  now: number
  /** Задержка появления (каскад при первой загрузке) */
  delay: number
  /** Нужен AnimatePresence mode="popLayout" */
  ref?: Ref<HTMLLIElement>
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

const URGENCY_STYLES: Record<Urgency, { card: string; badge: string }> = {
  overdue: {
    card: 'border-red-200 dark:border-red-500/30',
    badge: 'bg-red-100 text-red-700 ring-red-600/10 dark:bg-red-500/15 dark:text-red-300',
  },
  soon: {
    card: 'border-amber-200 dark:border-amber-500/30',
    badge: 'bg-amber-100 text-amber-800 ring-amber-600/10 dark:bg-amber-500/15 dark:text-amber-300',
  },
  normal: {
    card: 'border-slate-200 dark:border-slate-800',
    badge: 'bg-emerald-100 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  done: {
    card: 'border-slate-200 dark:border-slate-800',
    badge: 'bg-slate-100 text-slate-500 ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400',
  },
}

export function TaskItem({ task, subject, now, delay, ref, onToggle, onEdit, onDelete }: Props) {
  const { label, urgency } = deadlineInfo(task, now)
  const styles = URGENCY_STYLES[urgency]

  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: task.done ? 0.6 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.45, delay }}
      whileHover={{ y: -2 }}
      className={`group flex gap-3 rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-lg dark:bg-slate-900 ${styles.card}`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={task.done}
        aria-label={task.done ? 'Отметить как невыполненное' : 'Отметить как выполненное'}
        onClick={onToggle}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
          task.done
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-slate-300 hover:border-emerald-500 dark:border-slate-600'
        }`}
      >
        {task.done && (
          <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.6 }}>
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </motion.span>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {subject && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${COLORS[subject.color].badge}`}>
              {subject.name}
            </span>
          )}
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles.badge}`}>
            {label}
          </span>
        </div>

        <h3 className={`mt-2 font-semibold ${task.done ? 'line-through' : ''}`}>{TASK_TYPES[task.type]}</h3>
        {task.details && (
          <p className="mt-0.5 break-words whitespace-pre-line text-sm text-slate-600 dark:text-slate-400">{task.details}</p>
        )}

        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDue(task)}
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:opacity-0 sm:transition sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <button type="button" className={iconBtn} onClick={onEdit} aria-label="Редактировать задание">
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={`${iconBtn} hover:bg-red-50! hover:text-red-600! dark:hover:bg-red-500/10! dark:hover:text-red-400!`}
          onClick={onDelete}
          aria-label="Удалить задание"
        >
          <Trash className="h-4 w-4" />
        </button>
      </div>
    </motion.li>
  )
}
