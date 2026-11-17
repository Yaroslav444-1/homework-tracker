import type { CSSProperties } from 'react'

// Глянцевое кольцо: конический градиент с перепадами яркости даёт ощущение объёма,
// маска вырезает середину.
function ringStyle(thickness: string, from: number): CSSProperties {
  const mask = `radial-gradient(farthest-side, transparent calc(100% - ${thickness}), #000 calc(100% - ${thickness} + 1px))`
  return {
    background: `conic-gradient(from ${from}deg, #2a0bb0, #6b43ff, #b9a4ff 12%, #5d2fff 22%, #1d0780 40%, #4a1ee6 60%, #8f6dff 72%, #2a0bb0)`,
    maskImage: mask,
    WebkitMaskImage: mask,
  }
}

/** Декоративный фон: сетка и объёмные фиолетовые формы, как на референсе. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-grid absolute inset-0" />
      <div className="absolute inset-0 opacity-[var(--glow)]">
        <div
          className="absolute top-[-12rem] right-[-16rem] h-[38rem] w-[38rem] rotate-12 rounded-full blur-[1.5px] sm:top-[-8rem] sm:right-[-12rem]"
          style={ringStyle('6.5rem', 140)}
        />
        <div
          className="absolute bottom-[-20rem] left-[-14rem] h-[42rem] w-[42rem] rounded-full blur-[1.5px]"
          style={ringStyle('7rem', 320)}
        />
        {/* Свечение вокруг форм */}
        <div className="absolute -top-32 -right-24 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgb(117_80_255/0.35),transparent_65%)]" />
        <div className="absolute -bottom-24 -left-24 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgb(93_47_255/0.3),transparent_65%)]" />
      </div>
    </div>
  )
}
