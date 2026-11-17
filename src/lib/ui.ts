// Общие классы для полей и кнопок (цвета — из дизайн-токенов в index.css)
export const inputClass =
  'w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink outline-none transition ' +
  'placeholder:text-muted/70 hover:border-line-strong focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20'

export const labelClass = 'caption mb-2 block text-muted'

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-3 text-sm font-semibold text-white ' +
  'shadow-[0_8px_24px_-8px_rgb(93_47_255/0.7)] transition hover:brightness-110 hover:shadow-[0_10px_30px_-6px_rgb(93_47_255/0.8)] ' +
  'active:scale-[0.96] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40 disabled:opacity-50 disabled:active:scale-100'

export const btnSecondary =
  'glass inline-flex items-center justify-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-medium text-ink transition ' +
  'hover:border-line-strong hover:bg-surface-2 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30'

export const iconBtn =
  'inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink ' +
  'active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30'

export const dangerHover = 'hover:bg-red-500/10! hover:text-red-500! dark:hover:text-red-400!'
