import { COLORS, TASK_TYPES } from './constants'
import { isoDate } from './deadline'
import type { AppData, Subject, Task } from './types'

const DATA_KEY = 'hw-tracker:data'

function createDemoData(): AppData {
  const now = Date.now()
  const subjects: Subject[] = [
    { id: 'demo-math', name: 'Матанализ', color: 'indigo', demo: true },
    { id: 'demo-algo', name: 'Алгоритмы', color: 'emerald', demo: true },
    { id: 'demo-eng', name: 'Английский язык', color: 'amber', demo: true },
  ]
  const tasks: Task[] = [
    {
      id: 'demo-1', subjectId: 'demo-math', type: 'practice', details: 'Решить №1245–1260 из Демидовича',
      dueDate: isoDate(-1), dueTime: '', done: false, createdAt: now, demo: true,
    },
    {
      id: 'demo-2', subjectId: 'demo-algo', type: 'lab', details: 'Вариант 12, загрузить в Moodle',
      dueDate: isoDate(1), dueTime: '23:59', done: false, createdAt: now, demo: true,
    },
    {
      id: 'demo-3', subjectId: 'demo-eng', type: 'essay', details: 'Эссе на 250 слов: «My future profession»',
      dueDate: isoDate(5), dueTime: '10:00', done: false, createdAt: now, demo: true,
    },
  ]
  return { subjects, tasks }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(DATA_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (isAppData(parsed)) return parsed
    }
  } catch {
    // localStorage недоступен или данные повреждены — начинаем с демо
  }
  return createDemoData()
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data))
  } catch {
    // например, приватный режим Safari — данные останутся только до перезагрузки
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function isSubject(v: unknown): v is Subject {
  return isRecord(v) && typeof v.id === 'string' && typeof v.name === 'string' &&
    typeof v.color === 'string' && v.color in COLORS
}

function isTask(v: unknown): v is Task {
  return isRecord(v) &&
    typeof v.id === 'string' &&
    typeof v.subjectId === 'string' &&
    typeof v.type === 'string' && v.type in TASK_TYPES &&
    typeof v.details === 'string' &&
    typeof v.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.dueDate) &&
    typeof v.dueTime === 'string' && /^(\d{2}:\d{2})?$/.test(v.dueTime) &&
    typeof v.done === 'boolean' &&
    typeof v.createdAt === 'number'
}

function isAppData(v: unknown): v is AppData {
  return isRecord(v) &&
    Array.isArray(v.subjects) && v.subjects.every(isSubject) &&
    Array.isArray(v.tasks) && v.tasks.every(isTask)
}

export function exportData(data: AppData): void {
  const payload = { app: 'homework-tracker', version: 1, exportedAt: new Date().toISOString(), ...data }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `homework-backup-${isoDate()}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000) // Safari не успевает скачать при мгновенном revoke
}

export async function parseImportFile(file: File): Promise<AppData> {
  return parseAppData(await file.text())
}

/** Разбирает и проверяет JSON (файл импорта или данные с GitHub). */
export function parseAppData(text: string): AppData {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('файл не является корректным JSON')
  }
  if (!isAppData(parsed)) throw new Error('неверная структура данных')
  const subjectIds = new Set(parsed.subjects.map((s) => s.id))
  return {
    subjects: parsed.subjects,
    tasks: parsed.tasks.filter((t) => subjectIds.has(t.subjectId)),
  }
}
