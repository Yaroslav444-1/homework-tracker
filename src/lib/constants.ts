import type { ColorKey, TaskType } from './types'

export const TASK_TYPES: Record<TaskType, string> = {
  lab: 'Лабораторная работа',
  practice: 'Практическое задание / Семинар',
  essay: 'Реферат / Эссе',
  reading: 'Конспект / Прочитать материал',
  project: 'Курсовая / Проект',
  test: 'Подготовка к тесту / Контрольной',
  other: 'Другое',
}

// Классы записаны целиком, чтобы Tailwind нашёл их при сборке.
export const COLORS: Record<ColorKey, { name: string; dot: string; badge: string }> = {
  indigo: { name: 'Индиго', dot: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' },
  sky: { name: 'Голубой', dot: 'bg-sky-500', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300' },
  teal: { name: 'Бирюзовый', dot: 'bg-teal-500', badge: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300' },
  emerald: { name: 'Зелёный', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' },
  amber: { name: 'Жёлтый', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' },
  orange: { name: 'Оранжевый', dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300' },
  rose: { name: 'Красный', dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300' },
  pink: { name: 'Розовый', dot: 'bg-pink-500', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300' },
  violet: { name: 'Фиолетовый', dot: 'bg-violet-500', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300' },
  slate: { name: 'Серый', dot: 'bg-slate-500', badge: 'bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300' },
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
