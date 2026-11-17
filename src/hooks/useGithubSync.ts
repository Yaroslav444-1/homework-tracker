import { useCallback, useEffect, useRef, useState } from 'react'
import { checkRepo, fetchRemote, GithubError, isValidRepo, normalizeRepo, pushRemote, type GithubConfig } from '../lib/github'
import type { AppData } from '../lib/types'

// Хранится только в этом браузере и не попадает в экспорт JSON.
const KEY = 'hw-tracker:github'

interface SyncState extends GithubConfig {
  /** Версия файла на GitHub, с которой совпадали данные при последней синхронизации */
  sha: string | null
  /** Есть локальные изменения, ещё не отправленные на GitHub */
  dirty: boolean
  lastSyncAt: number | null
}

export type SyncStatus = 'idle' | 'syncing' | 'error'

const CONFLICT_MESSAGE =
  'На GitHub есть изменения с другого устройства, а на этом устройстве есть несохранённые изменения.\n\n' +
  'OK — загрузить данные с GitHub (изменения на этом устройстве пропадут).\n' +
  'Отмена — оставить данные этого устройства и записать их на GitHub.'

function loadState(): SyncState | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SyncState) : null
  } catch {
    return null
  }
}

function persist(state: SyncState | null): void {
  try {
    if (state) localStorage.setItem(KEY, JSON.stringify(state))
    else localStorage.removeItem(KEY)
  } catch {
    // localStorage недоступен
  }
}

/** Только демо-данные или пусто — такие данные можно молча заменить данными с GitHub. */
function isTrivial(data: AppData): boolean {
  return data.subjects.every((s) => s.demo) && data.tasks.every((t) => t.demo)
}

export function useGithubSync(data: AppData, setData: (data: AppData) => void) {
  const [state, setState] = useState<SyncState | null>(loadState)
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const stateRef = useRef(state)
  const dataRef = useRef(data)
  const lastJson = useRef(JSON.stringify(data))
  const appliedJson = useRef<string | null>(null) // данные, пришедшие с GitHub (не считаются изменением)
  const changeCount = useRef(0)
  const inFlight = useRef(false)
  const rerun = useRef(false)

  const update = useCallback((patch: Partial<SyncState>) => {
    if (!stateRef.current) return // успели отключиться
    const next = { ...stateRef.current, ...patch }
    stateRef.current = next
    persist(next)
    setState(next)
  }, [])

  const syncOnce = useCallback(async () => {
    const s = stateRef.current
    if (!s) return
    const startChange = changeCount.current
    const local = dataRef.current
    const remote = await fetchRemote(s)
    let sha: string

    if (remote && remote.sha !== s.sha) {
      // Файл на GitHub изменился с момента нашей последней синхронизации
      if (!s.dirty || isTrivial(local) || confirm(CONFLICT_MESSAGE)) {
        appliedJson.current = JSON.stringify(remote.data)
        setData(remote.data)
        update({ sha: remote.sha, dirty: false, lastSyncAt: Date.now() })
        return
      }
      sha = await pushRemote(s, local, remote.sha)
    } else if (!remote || s.dirty) {
      sha = await pushRemote(s, local, remote?.sha ?? null)
    } else {
      update({ lastSyncAt: Date.now() })
      return
    }

    const changedMeanwhile = changeCount.current !== startChange
    update({ sha, dirty: changedMeanwhile, lastSyncAt: Date.now() })
    if (changedMeanwhile) rerun.current = true
  }, [setData, update])

  const sync = useCallback(async (): Promise<void> => {
    if (!stateRef.current) return
    if (inFlight.current) {
      rerun.current = true
      return
    }
    inFlight.current = true
    setStatus('syncing')
    try {
      try {
        await syncOnce()
      } catch (e) {
        // Другое устройство успело сохранить раньше нас — перечитываем и решаем заново
        if (e instanceof GithubError && (e.status === 409 || e.status === 422)) await syncOnce()
        else throw e
      }
      setError(null)
      setStatus('idle')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setStatus('error')
    } finally {
      inFlight.current = false
      if (rerun.current) {
        rerun.current = false
        void sync()
      }
    }
  }, [syncOnce])

  // Локальные изменения: помечаем и отправляем через 1.5 с после последней правки
  useEffect(() => {
    dataRef.current = data
    const json = JSON.stringify(data)
    if (json === lastJson.current) return
    lastJson.current = json
    if (json === appliedJson.current) {
      appliedJson.current = null
      return
    }
    appliedJson.current = null
    changeCount.current++
    if (!stateRef.current) return
    if (!stateRef.current.dirty) update({ dirty: true })
    const id = setTimeout(() => void sync(), 1500)
    return () => clearTimeout(id)
  }, [data, sync, update])

  // При подключении, открытии вкладки и появлении интернета — подтягиваем изменения
  const connectedKey = state ? `${state.repo}:${state.token}` : null
  useEffect(() => {
    if (!connectedKey) return
    void sync()
    const onVisible = () => {
      if (document.visibilityState === 'visible') void sync()
    }
    const onOnline = () => void sync()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', onOnline)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onOnline)
    }
  }, [connectedKey, sync])

  const connect = async (repoInput: string, tokenInput: string): Promise<void> => {
    const cfg = { repo: normalizeRepo(repoInput), token: tokenInput.trim() }
    if (!isValidRepo(cfg.repo)) throw new Error('укажите репозиторий в формате логин/название')
    if (!cfg.token) throw new Error('вставьте токен')
    await checkRepo(cfg)
    // dirty: true — при первой синхронизации спросим, чьи данные оставить, если они есть и тут, и там
    const next: SyncState = { ...cfg, sha: null, dirty: true, lastSyncAt: null }
    stateRef.current = next
    persist(next)
    setState(next)
  }

  const disconnect = () => {
    stateRef.current = null
    persist(null)
    setState(null)
    setStatus('idle')
    setError(null)
  }

  return {
    connected: state !== null,
    repo: state?.repo ?? null,
    lastSyncAt: state?.lastSyncAt ?? null,
    dirty: state?.dirty ?? false,
    status,
    error,
    connect,
    disconnect,
    syncNow: sync,
  }
}

export type GithubSync = ReturnType<typeof useGithubSync>
