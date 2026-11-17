import type { Ref } from 'react'
import { motion } from 'motion/react'
import { CalendarDays, Check, Pencil, Trash } from 'lucide-react'
import { COLORS, TASK_TYPES } from '../lib/constants'
import { deadlineInfo, formatDue, type Urgency } from '../lib/deadline'
import { dangerHover, iconBtn } from '../lib/ui'
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

const URGENCY_STYLES: Record<Urgency, { card: string; badge: string; dot: string }> = {
  overdue: {
    card: 'border-red-500/40 [--pulse-color:rgb(239_68_68/0.55)]',
    badge: 'border-red-500/30 bg-red-500/12 text-red-700 dark:text-red-300',
    dot: 'bg-red-500',
  },
  soon: {
    card: 'border-amber-500/40 [--pulse-color:rgb(245_158_11/0.5)]',
    badge: 'border-amber-500/30 bg-amber-500/12 text-amber-800 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  normal: {
    card: 'border-line',
    badge: 'border-emerald-500/30 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  done: {
    card: 'border-line',
    badge: 'border-line bg-surface-2 text-muted',
    dot: 'bg-muted',
  },
}

export function TaskItem({ task, subject, now, delay, ref, onToggle, onEdit, onDelete }: Props) {
  const { label, urgency } = deadlineInfo(task, now)
  const styles = URGENCY_STYLES[urgency]
  // Пульсируют просроченные и сдающиеся сегодня
  const pulse = urgency === 'overdue' || (urgency === 'soon' && label === 'Сегодня')

  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: task.done ? 0.55 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.45, delay }}
      whileHover={{ y: -3 }}
      className={`glass group flex gap-4 rounded-[1.75rem] border p-5 transition-[border-color,box-shadow] hover:shadow-[0_18px_40px_-20px_rgb(93_47_255/0.6)] ${styles.card} ${
        pulse ? 'pulse-glow' : ''
      }`}
    >
      <motion.button
        type="button"
        role="checkbox"
        aria-checked={task.done}
        aria-label={task.done ? 'Отметить как невыполненное' : 'Отметить как выполненное'}
        onClick={onToggle}
        whileTap={{ scale: 0.8 }}
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          task.done
            ? 'border-transparent bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_4px_14px_-4px_rgb(93_47_255/0.9)]'
            : 'border-line-strong hover:border-brand-500'
        }`}
      >
        {task.done && (
          <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.6 }}>
            <Check className="h-4 w-4" strokeWidth={3} />
          </motion.span>
        )}
      </motion.button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {subject && (
            <span className={`caption rounded-full px-2.5 py-1 font-medium ${COLORS[subject.color].badge}`}>{subject.name}</span>
          )}
          <span className={`caption inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-bold ${styles.badge}`}>
            <span className="relative flex h-1.5 w-1.5">
              {pulse && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${styles.dot}`} />}
              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${styles.dot}`} />
            </span>
            {label}
          </span>
        </div>

        <h3 className={`mt-3 text-lg leading-snug font-bold tracking-tight ${task.done ? 'line-through decoration-2' : ''}`}>
          {TASK_TYPES[task.type]}
        </h3>
        {task.details && <p className="mt-1 text-sm break-words whitespace-pre-line text-muted">{task.details}</p>}

        <p className="caption mt-3 flex items-center gap-1.5 normal-case text-muted">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDue(task)}
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-1 sm:opacity-0 sm:transition sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <button type="button" className={iconBtn} onClick={onEdit} aria-label="Редактировать задание">
          <Pencil className="h-4 w-4" />
        </button>
        <button type="button" className={`${iconBtn} ${dangerHover}`} onClick={onDelete} aria-label="Удалить задание">
          <Trash className="h-4 w-4" />
        </button>
      </div>
    </motion.li>
  )
}
