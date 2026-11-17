import { useEffect, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { iconBtn } from '../lib/ui'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * На телефоне — «шторка» снизу, на широком экране — окно по центру.
 * Рендерить внутри <AnimatePresence>, чтобы работала анимация закрытия.
 */
export function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[2rem] border border-line bg-elevated shadow-2xl shadow-black/40 backdrop-blur-2xl sm:max-w-lg sm:rounded-[2rem]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-elevated/80 px-6 py-4 backdrop-blur">
          <h2 className="text-lg font-bold tracking-tight uppercase">{title}</h2>
          <button type="button" className={iconBtn} onClick={onClose} aria-label="Закрыть">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  )
}
