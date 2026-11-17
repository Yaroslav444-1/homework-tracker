import type { Task } from './types'

const HOUR = 3_600_000
const DAY = 24 * HOUR

export type Urgency = 'overdue' | 'soon' | 'normal' | 'done'

function parseDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Момент сдачи. Без указанного времени — конец дня (23:59). */
export function dueTimestamp(task: Pick<Task, 'dueDate' | 'dueTime'>): number {
  const date = parseDate(task.dueDate)
  const [hh, mm] = task.dueTime ? task.dueTime.split(':').map(Number) : [23, 59]
  date.setHours(hh, mm)
  return date.getTime()
}

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

export function deadlineInfo(task: Task, now: number): { label: string; urgency: Urgency } {
  if (task.done) return { label: 'Выполнено', urgency: 'done' }

  const due = dueTimestamp(task)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  // Math.round сглаживает переход на летнее/зимнее время
  const dayDiff = Math.round((parseDate(task.dueDate).getTime() - today.getTime()) / DAY)

  if (due < now) {
    return {
      label: dayDiff < 0 ? `Просрочено на ${-dayDiff} дн.` : 'Просрочено сегодня',
      urgency: 'overdue',
    }
  }

  const label =
    dayDiff === 0
      ? 'Сегодня'
      : dayDiff === 1
        ? 'Завтра'
        : `Через ${dayDiff} ${plural(dayDiff, 'день', 'дня', 'дней')}`

  return { label, urgency: due - now < 48 * HOUR ? 'soon' : 'normal' }
}

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })

/** «пн, 18 ноября · 14:00» */
export function formatDue(task: Pick<Task, 'dueDate' | 'dueTime'>): string {
  const date = dateFormatter.format(parseDate(task.dueDate))
  return task.dueTime ? `${date} · ${task.dueTime}` : date
}

/** Дата в формате YYYY-MM-DD со сдвигом на offset дней от сегодня (локальное время). */
export function isoDate(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
