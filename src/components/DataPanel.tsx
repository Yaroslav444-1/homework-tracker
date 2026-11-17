import { useRef, type ChangeEvent } from 'react'
import { Cloud, Download, HardDrive, Settings2, Upload } from 'lucide-react'
import { SyncStatusLine } from './SyncStatusLine'
import { btnPrimary, btnSecondary, iconBtn } from '../lib/ui'
import type { GithubSync } from '../hooks/useGithubSync'

interface Props {
  sync: GithubSync
  onOpenSync: () => void
  onExport: () => void
  onImport: (file: File) => void
}

export function DataPanel({ sync, onOpenSync, onExport, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onImport(file)
    e.target.value = '' // чтобы можно было выбрать тот же файл повторно
  }

  return (
    <section className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <Cloud className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">Синхронизация</h2>
              {sync.connected && (
                <button type="button" className={`${iconBtn} -my-2 -mr-2`} onClick={onOpenSync} aria-label="Настройки синхронизации">
                  <Settings2 className="h-4 w-4" />
                </button>
              )}
            </div>
            {sync.connected ? (
              <div className="mt-1">
                <SyncStatusLine sync={sync} />
              </div>
            ) : (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Бесплатно синхронизируйте задания между ПК и телефоном через свой приватный репозиторий GitHub.
              </p>
            )}
          </div>
        </div>
        {!sync.connected && (
          <button type="button" className={`${btnPrimary} mt-4 w-full`} onClick={onOpenSync}>
            Настроить синхронизацию
          </button>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3">
          <HardDrive className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
          <div>
            <h2 className="font-semibold">Резервная копия</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Задания хранятся в этом браузере. Сохраните их в JSON-файл или загрузите из файла.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button type="button" className={btnSecondary} onClick={onExport}>
            <Download className="h-4 w-4" />
            Экспорт в JSON
          </button>
          <button type="button" className={btnSecondary} onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Импорт из JSON
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
        </div>
      </div>
    </section>
  )
}
