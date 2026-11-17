// Хранение данных в файле приватного репозитория через GitHub REST API (Contents API).
// Запросы идут напрямую из браузера на api.github.com — никаких промежуточных серверов.
import { parseAppData } from './storage'
import type { AppData } from './types'

export interface GithubConfig {
  /** «логин/репозиторий» */
  repo: string
  token: string
}

const API = 'https://api.github.com'
const FILE = 'homework-data.json'

export class GithubError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

function errorFor(status: number): GithubError {
  const message =
    status === 401 ? 'неверный или просроченный токен'
    : status === 403 ? 'у токена нет нужных прав или превышен лимит запросов'
    : status === 404 ? 'репозиторий не найден или у токена нет к нему доступа'
    : status === 409 || status === 422 ? 'данные на GitHub изменились во время сохранения'
    : `GitHub вернул ошибку ${status}`
  return new GithubError(message, status)
}

async function request(cfg: GithubConfig, path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(API + path, {
      ...init,
      cache: 'no-store',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${cfg.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      },
    })
  } catch {
    throw new GithubError('нет соединения с GitHub', 0)
  }
}

// btoa/atob работают только с Latin-1, поэтому кириллицу кодируем через байты UTF-8
function toBase64(text: string): string {
  let binary = ''
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(base64: string): string {
  const binary = atob(base64.replace(/\s/g, ''))
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)))
}

/** «https://github.com/user/repo.git» → «user/repo» */
export function normalizeRepo(input: string): string {
  return input.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/\/+$/, '')
}

export function isValidRepo(repo: string): boolean {
  return /^[\w.-]+\/[\w.-]+$/.test(repo)
}

/** Проверяет доступ к репозиторию и что он приватный. */
export async function checkRepo(cfg: GithubConfig): Promise<void> {
  const res = await request(cfg, `/repos/${cfg.repo}`)
  if (!res.ok) throw errorFor(res.status)
  const info = (await res.json()) as { private: boolean }
  if (!info.private) {
    throw new GithubError(
      'репозиторий публичный — его содержимое видят все. Сделайте его приватным: Settings → General → Danger Zone → Change visibility',
      0,
    )
  }
}

/** null — файла ещё нет (например, репозиторий пустой). */
export async function fetchRemote(cfg: GithubConfig): Promise<{ data: AppData; sha: string } | null> {
  const res = await request(cfg, `/repos/${cfg.repo}/contents/${FILE}`)
  if (res.status === 404) return null
  if (!res.ok) throw errorFor(res.status)
  const json = (await res.json()) as { content: string; sha: string }
  return { data: parseAppData(fromBase64(json.content)), sha: json.sha }
}

/** Сохраняет данные. sha — версия файла, которую мы перезаписываем (null — создать файл). Возвращает новый sha. */
export async function pushRemote(cfg: GithubConfig, data: AppData, sha: string | null): Promise<string> {
  const body = {
    message: `Синхронизация ${new Date().toLocaleString('ru-RU')}`,
    content: toBase64(JSON.stringify(data, null, 2)),
    ...(sha ? { sha } : {}),
  }
  const res = await request(cfg, `/repos/${cfg.repo}/contents/${FILE}`, { method: 'PUT', body: JSON.stringify(body) })
  if (!res.ok) throw errorFor(res.status)
  const json = (await res.json()) as { content: { sha: string } }
  return json.content.sha
}
