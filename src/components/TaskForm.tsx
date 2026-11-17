import { useState, type FormEvent } from 'react'
import { Modal } from './Modal'
import { Select } from './Select'
import { COLORS, TASK_TYPES } from '../lib/constants'
import { btnPrimary, btnSecondary, inputClass, labelClass } from '../lib/ui'
import type { Subject, Task, TaskDraft, TaskType } from '../lib/types'

interface Props {
  subjects: Subject[]
  task?: Task
  defaultSubjectId?: string
  onSave: (draft: TaskDraft) => void
  onClose: () => void
}

const TYPE_OPTIONS = (Object.entries(TASK_TYPES) as [TaskType, string][]).map(([value, label]) => ({ value, label }))

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
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="task-subject" className={labelClass}>Предмет</label>
          <Select
            id="task-subject"
            value={draft.subjectId}
            options={subjects.map((s) => ({ value: s.id, label: s.name, dot: COLORS[s.color].dot }))}
            onChange={(v) => set('subjectId', v)}
          />
        </div>

        <div>
          <label htmlFor="task-type" className={labelClass}>Что надо сделать</label>
          <Select id="task-type" value={draft.type} options={TYPE_OPTIONS} onChange={(v) => set('type', v)} />
        </div>

        <div>
          <label htmlFor="task-details" className={labelClass}>
            Детали <span className="normal-case opacity-70">(необязательно)</span>
          </label>
          <textarea
            id="task-details"
            className={`${inputClass} min-h-24 resize-y`}
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
              Время <span className="normal-case opacity-70">(необяз.)</span>
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
        <p className="-mt-2 text-xs text-muted">Без времени срок считается до конца дня.</p>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" className={btnSecondary} onClick={onClose}>Отмена</button>
          <button type="submit" className={btnPrimary}>{task ? 'Сохранить' : 'Добавить задание'}</button>
        </div>
      </form>
    </Modal>
  )
}
