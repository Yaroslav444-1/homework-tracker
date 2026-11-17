import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

export function useTheme(): [Theme, () => void] {
  // Начальный класс .dark выставляет скрипт в index.html
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('hw-tracker:theme', theme)
    } catch {
      // игнорируем недоступный localStorage
    }
  }, [theme])

  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))]
}
