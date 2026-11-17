import { AnimatePresence, motion } from 'motion/react'
import { GraduationCap, Moon, Sun } from 'lucide-react'

interface Props {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function Header({ theme, onToggleTheme }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_6px_20px_-6px_rgb(93_47_255/0.8)]"
          >
            <GraduationCap className="h-5 w-5" />
          </motion.div>
          <div className="min-w-0 leading-none">
            <h1 className="text-sm leading-tight font-extrabold tracking-tight uppercase sm:text-lg">Трекер домашнего задания</h1>
            <p className="caption mt-1 normal-case tracking-normal text-muted">все дедлайны в одном месте</p>
          </div>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          className="glass inline-flex h-10 w-10 border border-line items-center justify-center overflow-hidden rounded-full text-ink transition-colors hover:border-line-strong"
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
        </motion.button>
      </div>
    </header>
  )
}
