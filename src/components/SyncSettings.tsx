import { useState, type FormEvent } from 'react'
import { ExternalLink, Lock, RefreshCw, Unplug } from 'lucide-react'
import { Modal } from './Modal'
import { SyncStatusLine } from './SyncStatusLine'
import { btnPrimary, btnSecondary, inputClass, labelClass } from '../lib/ui'
import type { GithubSync } from '../hooks/useGithubSync'

interface Props {
  sync: GithubSync
  onClose: () => void
}

const linkClass = 'inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline dark:text-indigo-400'

export function SyncSettings({ sync, onClose }: Props) {
  const [repo, setRepo] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await sync.connect(repo, token)
      setToken('')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const disconnect = () => {
    if (confirm('Отключить синхронизацию на этом устройстве? Токен будет удалён из браузера, задания останутся.')) sync.disconnect()
  }

  return (
    <Modal title="Синхронизация с GitHub" onClose={onClose}>
      {sync.connected ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="text-sm text-slate-500 dark:text-slate-400">Подключено к репозиторию</p>
            <p className="mt-0.5 font-semibold break-all">{sync.repo}</p>
            <div className="mt-3">
              <SyncStatusLine sync={sync} />
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Изменения отправляются автоматически, а при открытии сайта подтягиваются данные с других устройств.
            Чтобы подключить телефон, откройте там этот сайт и введите тот же репозиторий и токен.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" className={btnPrimary} onClick={() => void sync.syncNow()} disabled={sync.status === 'syncing'}>
              <RefreshCw className={`h-4 w-4 ${sync.status === 'syncing' ? 'animate-spin' : ''}`} />
              Синхронизировать сейчас
            </button>
            <button type="button" className={btnSecondary} onClick={disconnect}>
              <Unplug className="h-4 w-4" />
              Отключить
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
            <li>
              Создайте <b>приватный</b> репозиторий, например <code>homework-data</code>:{' '}
              <a className={linkClass} href="https://github.com/new" target="_blank" rel="noreferrer">
                github.com/new <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              Создайте токен (Fine-grained):{' '}
              <a className={linkClass} href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
                создать токен <ExternalLink className="h-3 w-3" />
              </a>
              <br />
              <span className="text-slate-500 dark:text-slate-400">
                Repository access → <i>Only select repositories</i> → ваш репозиторий. Permissions → <i>Contents</i> → <i>Read and write</i>.
              </span>
            </li>
            <li>Вставьте название репозитория и токен ниже. На телефоне сделайте то же самое.</li>
          </ol>

          <div>
            <label htmlFor="sync-repo" className={labelClass}>Репозиторий</label>
            <input
              id="sync-repo"
              className={inputClass}
              placeholder="логин/homework-data"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          </div>
          <div>
            <label htmlFor="sync-token" className={labelClass}>Токен</label>
            <input
              id="sync-token"
              type="password"
              className={inputClass}
              placeholder="github_pat_…"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
              Не удалось подключиться: {error}
            </p>
          )}

          <button type="submit" className={`${btnPrimary} w-full`} disabled={busy}>
            {busy && <RefreshCw className="h-4 w-4 animate-spin" />}
            {busy ? 'Проверяем…' : 'Подключить'}
          </button>
        </form>
      )}

      <p className="mt-5 flex gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <Lock className="h-4 w-4 shrink-0" />
        Данные хранятся в вашем приватном репозитории, который видите только вы. Токен остаётся в этом браузере и не попадает
        в экспорт JSON. Сайт общается только с api.github.com — сторонних серверов нет.
      </p>
    </Modal>
  )
}
