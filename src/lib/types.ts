export type ColorKey =
  | 'indigo'
  | 'sky'
  | 'teal'
  | 'emerald'
  | 'amber'
  | 'orange'
  | 'rose'
  | 'pink'
  | 'violet'
  | 'slate'

export type TaskType = 'lab' | 'practice' | 'essay' | 'reading' | 'project' | 'test' | 'other'

export interface Subject {
  id: string
  name: string
  color: ColorKey
  demo?: boolean
}

export interface Task {
  id: string
  subjectId: string
  type: TaskType
  details: string
  /** Дата сдачи в формате YYYY-MM-DD */
  dueDate: string
  /** Время сдачи HH:MM или пустая строка (= до конца дня) */
  dueTime: string
  done: boolean
  createdAt: number
  demo?: boolean
}

export interface AppData {
  subjects: Subject[]
  tasks: Task[]
}

export type TaskDraft = Pick<Task, 'subjectId' | 'type' | 'details' | 'dueDate' | 'dueTime'>
