import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Pencil, Plus, Trash } from 'lucide-react'
import { Modal } from './Modal'
import { COLORS } from '../lib/constants'
import { plural } from '../lib/deadline'
import { btnPrimary, btnSecondary, dangerHover, iconBtn, inputClass, labelClass } from '../lib/ui'
import type { ColorKey, Subject, Task } from '../lib/types'

interface Props {
  subjects: Subject[]
  tasks: Task[]
  onAdd: (name: string, color: ColorKey) => void
  onUpdate: (id: string, name: string, color: ColorKey) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function SubjectManager({ subjects, tasks, onAdd, onUpdate, onDelete, onClose }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState<ColorKey>('indigo')

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setColor('indigo')
  }

  const startEdit = (s: Subject) => {
    setEditingId(s.id)
    setName(s.name)
    setColor(s.color)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (editingId) onUpdate(editingId, trimmed, color)
    else onAdd(trimmed, color)
    resetForm()
  }

  const remove = (s: Subject) => {
    const count = tasks.filter((t) => t.subjectId === s.id).length
    const warning = count ? `\nВместе с ним будут удалены ${count} ${plural(count, 'задание', 'задания', 'заданий')}.` : ''
    if (!confirm(`Удалить предмет «${s.name}»?${warning}`)) return
    if (editingId === s.id) resetForm()
    onDelete(s.id)
  }

  return (
    <Modal title="Предметы" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4 rounded-3xl border border-line bg-surface p-4">
        <div>
          <label htmlFor="subject-name" className={labelClass}>
            {editingId ? 'Редактирование предмета' : 'Новый предмет'}
          </label>
          <input
            id="subject-name"
            className={inputClass}
            placeholder="Например: Матанализ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoFocus
          />
        </div>
        <div>
          <span className={labelClass}>Цвет бейджа</span>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(COLORS) as ColorKey[]).map((key) => (
              <motion.button
                key={key}
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={() => setColor(key)}
                title={COLORS[key].name}
                aria-label={COLORS[key].name}
                aria-pressed={color === key}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-white transition ${COLORS[key].dot} ${
                  color === key ? 'ring-2 ring-ink ring-offset-2 ring-offset-canvas' : 'hover:scale-110'
                }`}
              >
                {color === key && <Check className="h-4 w-4" />}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className={btnPrimary} disabled={!name.trim()}>
            {editingId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? 'Сохранить' : 'Добавить'}
          </button>
          {editingId && (
            <button type="button" className={btnSecondary} onClick={resetForm}>
              Отмена
            </button>
          )}
        </div>
      </form>

      <ul className="mt-5 divide-y divide-line">
        {subjects.length === 0 && <li className="py-6 text-center text-sm text-muted">Пока нет ни одного предмета</li>}
        <AnimatePresence initial={false}>
          {subjects.map((s) => {
            const count = tasks.filter((t) => t.subjectId === s.id).length
            return (
              <motion.li
                key={s.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="flex items-center gap-3 py-3"
              >
                <span className={`caption rounded-full px-2.5 py-1 font-medium ${COLORS[s.color].badge}`}>{s.name}</span>
                <span className="flex-1 text-xs text-muted">
                  {count} {plural(count, 'задание', 'задания', 'заданий')}
                </span>
                <button type="button" className={iconBtn} onClick={() => startEdit(s)} aria-label={`Изменить «${s.name}»`}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" className={`${iconBtn} ${dangerHover}`} onClick={() => remove(s)} aria-label={`Удалить «${s.name}»`}>
                  <Trash className="h-4 w-4" />
                </button>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </Modal>
  )
}
