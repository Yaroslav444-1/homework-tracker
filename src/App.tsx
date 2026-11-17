import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { BookOpen, Inbox, Plus, Sparkles } from 'lucide-react'
import { Header } from './components/Header'
import { SubjectFilter } from './components/SubjectFilter'
import { SubjectManager } from './components/SubjectManager'
import { TaskForm } from './components/TaskForm'
import { TaskItem } from './components/TaskItem'
import { DataPanel } from './components/DataPanel'
import { SyncSettings } from './components/SyncSettings'
import { useGithubSync } from './hooks/useGithubSync'
import { useTheme } from './hooks/useTheme'
import { newId } from './lib/constants'
import { dueTimestamp, plural } from './lib/deadline'
import { exportData, loadData, parseImportFile, saveData } from './lib/storage'
import { btnPrimary } from './lib/ui'
import type { AppData, ColorKey, Task, TaskDraft } from './lib/types'

export default function App() {
  const [theme, toggleTheme] = useTheme()
  const [data, setData] = useState<AppData>(loadData)
  const [filter, setFilter] = useState<string>('all')
  const [showDone, setShowDone] = useState(false)
  const [taskForm, setTaskForm] = useState<{ task?: Task } | null>(null)
  const [managerOpen, setManagerOpen] = useState(false)
  const [syncOpen, setSyncOpen] = useState(false)
  const sync = useGithubSync(data, setData)
  const [now, setNow] = useState(Date.now)
  // Каскадное появление карточек — только при первой загрузке страницы
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => saveData(data), [data])

  // Раз в минуту пересчитываем бейджи «Сегодня / Просрочено»
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setTimeout(() => setInitialLoad(false), 1000)
    return () => clearTimeout(id)
  }, [])

  const { subjects, tasks } = data
  const subjectById = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects])
  const hasDemo = subjects.some((s) => s.demo) || tasks.some((t) => t.demo)

  const activeCounts: Record<string, number> = {}
  for (const t of tasks) if (!t.done) activeCounts[t.subjectId] = (activeCounts[t.subjectId] ?? 0) + 1
  const totalActive = tasks.filter((t) => !t.done).length

  // Предмет мог исчезнуть (удаление, импорт, данные с другого устройства) — тогда показываем все
  const activeFilter = subjectById.has(filter) ? filter : 'all'
  const inFilter = tasks.filter((t) => activeFilter === 'all' || t.subjectId === activeFilter)
  const doneInFilter = inFilter.filter((t) => t.done).length
  const activeInFilter = inFilter.length - doneInFilter
  const visible = inFilter
    .filter((t) => showDone || !t.done)
    .sort((a, b) => Number(a.done) - Number(b.done) || dueTimestamp(a) - dueTimestamp(b))
  const title = subjectById.get(filter)?.name ?? 'Все задания'

  // --- Задания ---
  const saveTask = (draft: TaskDraft) => {
    const editing = taskForm?.task
    setData((d) => ({
      ...d,
      tasks: editing
        ? d.tasks.map((t) => (t.id === editing.id ? { ...t, ...draft } : t))
        : [...d.tasks, { ...draft, id: newId(), done: false, createdAt: Date.now() }],
    }))
    setTaskForm(null)
  }

  const toggleTask = (id: string) =>
    setData((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }))

  const deleteTask = (id: string) => {
    if (!confirm('Удалить это задание?')) return
    setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }))
  }

  // --- Предметы ---
  const addSubject = (name: string, color: ColorKey) =>
    setData((d) => ({ ...d, subjects: [...d.subjects, { id: newId(), name, color }] }))

  const updateSubject = (id: string, name: string, color: ColorKey) =>
    setData((d) => ({ ...d, subjects: d.subjects.map((s) => (s.id === id ? { ...s, name, color } : s)) }))

  const deleteSubject = (id: string) => {
    setData((d) => ({
      subjects: d.subjects.filter((s) => s.id !== id),
      tasks: d.tasks.filter((t) => t.subjectId !== id),
    }))
    if (filter === id) setFilter('all')
  }

  // --- Данные ---
  const clearDemo = () => {
    if (!confirm('Удалить демонстрационные предметы и задания? Задания, добавленные в демо-предметы, тоже будут удалены.')) return
    setData((d) => {
      const subjects = d.subjects.filter((s) => !s.demo)
      const ids = new Set(subjects.map((s) => s.id))
      return { subjects, tasks: d.tasks.filter((t) => !t.demo && ids.has(t.subjectId)) }
    })
    setFilter('all')
  }

  const importFile = async (file: File) => {
    try {
      const imported = await parseImportFile(file)
      const msg =
        `Импорт заменит текущие данные.\n` +
        `В файле: ${imported.subjects.length} ${plural(imported.subjects.length, 'предмет', 'предмета', 'предметов')}, ` +
        `${imported.tasks.length} ${plural(imported.tasks.length, 'задание', 'задания', 'заданий')}. Продолжить?`
      if (!confirm(msg)) return
      setData(imported)
      setFilter('all')
    } catch (e) {
      alert(`Не удалось импортировать файл: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh">
        <Header theme={theme} onToggleTheme={toggleTheme} />

        {/* Телефон: одна колонка. ПК (lg+): сайдбар слева, задания справа во всю ширину. */}
        <div className="mx-auto grid max-w-[1800px] gap-6 px-4 py-6 pb-16 lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:px-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6 lg:col-start-1 lg:row-start-1">
            <AnimatePresence initial={false}>
              {hasDemo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 sm:flex-row sm:items-center lg:flex-col lg:items-stretch dark:border-indigo-500/30 dark:bg-indigo-500/10">
                    <div className="flex flex-1 gap-3">
                      <Sparkles className="h-5 w-5 shrink-0 text-indigo-500" />
                      <p className="text-sm text-indigo-900 dark:text-indigo-200">
                        Это демо-данные, чтобы показать, как всё работает. Удалите их, когда начнёте добавлять свои задания.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearDemo}
                      className="rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-indigo-700 shadow-sm ring-1 ring-indigo-200 transition hover:bg-indigo-100 active:scale-[0.97] dark:bg-indigo-500/20 dark:text-indigo-200 dark:ring-indigo-500/30 dark:hover:bg-indigo-500/30"
                    >
                      Очистить демо-данные
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <SubjectFilter
              subjects={subjects}
              activeCounts={activeCounts}
              totalActive={totalActive}
              selected={activeFilter}
              onSelect={setFilter}
              onManage={() => setManagerOpen(true)}
            />
          </aside>

          <main className="min-w-0 space-y-5 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.h2
                    key={title}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.18 }}
                    className="truncate text-2xl font-bold tracking-tight lg:text-3xl"
                  >
                    {title}
                  </motion.h2>
                </AnimatePresence>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {activeInFilter} {plural(activeInFilter, 'активное задание', 'активных задания', 'активных заданий')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-slate-600 select-none dark:text-slate-300">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={showDone}
                    onChange={(e) => setShowDone(e.target.checked)}
                  />
                  <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-indigo-600 peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-500/30 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition after:duration-300 peer-checked:after:translate-x-5 dark:bg-slate-700" />
                  Показывать выполненные{doneInFilter > 0 && <span className="text-slate-400">({doneInFilter})</span>}
                </label>
                <button
                  type="button"
                  className={btnPrimary}
                  onClick={() => (subjects.length ? setTaskForm({}) : setManagerOpen(true))}
                >
                  <Plus className="h-4 w-4" />
                  Добавить задание
                </button>
              </div>
            </div>

            {subjects.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="h-6 w-6" />}
                title="Добавьте первый предмет"
                text="Задания группируются по предметам — начните с создания хотя бы одного."
                action={
                  <button type="button" className={btnPrimary} onClick={() => setManagerOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Добавить предмет
                  </button>
                }
              />
            ) : visible.length === 0 ? (
              <EmptyState
                key={activeFilter}
                icon={<Inbox className="h-6 w-6" />}
                title="Нет активных заданий"
                text={doneInFilter > 0 ? 'Все задания выполнены — отличная работа!' : 'Добавьте задание, чтобы не пропустить дедлайн.'}
              />
            ) : (
              <ul className="relative grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {visible.map((t, i) => (
                    <TaskItem
                      key={t.id}
                      task={t}
                      subject={subjectById.get(t.subjectId)}
                      now={now}
                      delay={initialLoad ? Math.min(i, 10) * 0.05 : 0}
                      onToggle={() => toggleTask(t.id)}
                      onEdit={() => setTaskForm({ task: t })}
                      onDelete={() => deleteTask(t.id)}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </main>

          <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
            <DataPanel sync={sync} onOpenSync={() => setSyncOpen(true)} onExport={() => exportData(data)} onImport={importFile} />
          </div>
        </div>

        <AnimatePresence>
          {taskForm && (
            <TaskForm
              key="task-form"
              subjects={subjects}
              task={taskForm.task}
              defaultSubjectId={activeFilter !== 'all' ? activeFilter : undefined}
              onSave={saveTask}
              onClose={() => setTaskForm(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {syncOpen && <SyncSettings key="sync-settings" sync={sync} onClose={() => setSyncOpen(false)} />}
        </AnimatePresence>

        <AnimatePresence>
          {managerOpen && (
            <SubjectManager
              key="subject-manager"
              subjects={subjects}
              tasks={tasks}
              onAdd={addSubject}
              onUpdate={updateSubject}
              onDelete={deleteSubject}
              onClose={() => setManagerOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}

function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700"
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      >
        {icon}
      </motion.div>
      <h2 className="mt-4 font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
