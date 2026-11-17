import { CloudCheck, CloudOff, RefreshCw } from 'lucide-react'
import type { GithubSync } from '../hooks/useGithubSync'

const timeFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export function SyncStatusLine({ sync }: { sync: GithubSync }) {
  if (sync.status === 'syncing') {
    return (
      <p className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
        <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
        Синхронизация…
      </p>
    )
  }
  if (sync.status === 'error') {
    return (
      <p className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
        <CloudOff className="mt-0.5 h-4 w-4 shrink-0" />
        <span>Ошибка: {sync.error}</span>
      </p>
    )
  }
  return (
    <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
      <CloudCheck className="h-4 w-4 shrink-0" />
      {sync.dirty || !sync.lastSyncAt ? 'Ожидает синхронизации' : `Синхронизировано · ${timeFormatter.format(sync.lastSyncAt)}`}
    </p>
  )
}
