import { AnimatePresence, motion } from 'motion/react'
import { GraduationCap, Moon, Sun } from 'lucide-react'
import { iconBtn } from '../lib/ui'

interface Props {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function Header({ theme, onToggleTheme }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg dark:border-slate-800/70 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25"
          >
            <GraduationCap className="h-5 w-5" />
          </motion.div>
          <div className="leading-tight">
            <h1 className="text-base font-bold sm:text-lg">Трекер домашних заданий</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Все дедлайны в одном месте</p>
          </div>
        </div>
        <button
          type="button"
          className={`${iconBtn} overflow-hidden`}
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ y: 16, rotate: -90, opacity: 0 }}
              animate={{ y: 0, rotate: 0, opacity: 1 }}
              exit={{ y: -16, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </header>
  )
}
