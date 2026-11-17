import { useState, type FormEvent } from 'react'
import { Modal } from './Modal'
import { TASK_TYPES } from '../lib/constants'
import { btnPrimary, btnSecondary, inputClass, labelClass } from '../lib/ui'
import type { Subject, Task, TaskDraft, TaskType } from '../lib/types'

interface Props {
  subjects: Subject[]
  task?: Task
  defaultSubjectId?: string
  onSave: (draft: TaskDraft) => void
  onClose: () => void
}

export function TaskForm({ subjects, task, defaultSubjectId, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<TaskDraft>(() => ({
    subjectId: task?.subjectId ?? defaultSubjectId ?? subjects[0]?.id ?? '',
    type: task?.type ?? 'lab',
    details: task?.details ?? '',
    dueDate: task?.dueDate ?? '',
    dueTime: task?.dueTime ?? '',
  }))

  const set = <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSave({ ...draft, details: draft.details.trim() })
  }

  return (
    <Modal title={task ? 'Редактировать задание' : 'Новое задание'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="task-subject" className={labelClass}>Предмет</label>
          <select
            id="task-subject"
            className={inputClass}
            value={draft.subjectId}
            onChange={(e) => set('subjectId', e.target.value)}
            required
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="task-type" className={labelClass}>Что надо сделать</label>
          <select
            id="task-type"
            className={inputClass}
            value={draft.type}
            onChange={(e) => set('type', e.target.value as TaskType)}
          >
            {(Object.entries(TASK_TYPES) as [TaskType, string][]).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="task-details" className={labelClass}>
            Детали <span className="font-normal text-slate-400">(необязательно)</span>
          </label>
          <textarea
            id="task-details"
            className={`${inputClass} min-h-20 resize-y`}
            placeholder="Например: Вариант 12, загрузить в Moodle"
            value={draft.details}
            onChange={(e) => set('details', e.target.value)}
            maxLength={500}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-date" className={labelClass}>Срок сдачи</label>
            <input
              id="task-date"
              type="date"
              className={inputClass}
              value={draft.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="task-time" className={labelClass}>
              Время <span className="font-normal text-slate-400">(необяз.)</span>
            </label>
            <input
              id="task-time"
              type="time"
              className={inputClass}
              value={draft.dueTime}
              onChange={(e) => set('dueTime', e.target.value)}
            />
          </div>
        </div>
        <p className="-mt-2 text-xs text-slate-500 dark:text-slate-400">Без времени срок считается до конца дня.</p>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" className={btnSecondary} onClick={onClose}>Отмена</button>
          <button type="submit" className={btnPrimary}>{task ? 'Сохранить' : 'Добавить задание'}</button>
        </div>
      </form>
    </Modal>
  )
}
