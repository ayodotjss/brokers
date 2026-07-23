import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useApp } from '../context/AppContext'
import { preloadAssets } from '../lib/preload'

export default function Preloader() {
  const { appRevealed, dispatch } = useApp()
  const [display, setDisplay] = useState(0) // smoothed % that drives bar + counter
  const targetRef = useRef(0)
  const animRef = useRef(null)

  // kick off the real asset preload once
  useEffect(() => {
    let cancelled = false
    const finish = () => {
      if (cancelled) return
      targetRef.current = 100
      dispatch({ type: 'ASSETS_READY' })
    }
    // safety net: a stalled fetch (slow mobile data) must never trap the loader
    const fallback = setTimeout(finish, 12000)

    preloadAssets((pct) => {
      if (cancelled) return
      targetRef.current = pct
      dispatch({ type: 'PROGRESS', value: pct })
    }).then(() => {
      clearTimeout(fallback)
      finish()
    })
    return () => {
      cancelled = true
      clearTimeout(fallback)
    }
  }, [dispatch])

  // ease the displayed number toward the real progress so it never jumps
  useEffect(() => {
    const tick = setInterval(() => {
      setDisplay((d) => {
        const target = targetRef.current
        if (d >= target) return d
        const next = d + Math.max(0.5, (target - d) * 0.12)
        return Math.min(next, target)
      })
    }, 30)
    return () => clearInterval(tick)
  }, [])

  // when display hits 100, hold a beat then reveal
  useEffect(() => {
    if (display >= 100 && !animRef.current) {
      animRef.current = setTimeout(() => dispatch({ type: 'REVEAL' }), 650)
    }
    return () => {}
  }, [display, dispatch])

  const pct = Math.floor(display)

  return (
    <AnimatePresence>
      {!appRevealed && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-cream"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 1.1, ease: [0.87, 0, 0.13, 1] }}
        >
          {/* faint oversized wordmark behind everything */}
          <span
            className="font-display pointer-events-none absolute select-none text-primary/5 leading-none"
            style={{ fontSize: 'min(28vw, 340px)' }}
          >
            BROKER
          </span>

          <div className="relative w-[min(78vw,520px)]">
            {/* logo rides the tip of the bar */}
            <motion.img
              src="/logo.png"
              alt=""
              className="absolute -top-12 h-10 w-10 -translate-x-1/2 object-contain"
              style={{ left: `${pct}%` }}
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            />

            {/* track */}
            <div className="relative h-9 overflow-hidden rounded-full border border-primary/25 bg-card/60 shadow-broker">
              {/* fill */}
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-100 ease-linear"
                style={{ width: `${display}%` }}
              />
              {/* percentage counting INSIDE the bar, flips color as fill passes it */}
              <span className="font-display absolute inset-0 flex items-center justify-center text-lg tracking-[0.25em] text-primary mix-blend-normal">
                <span className="relative z-10 text-ink/70">{pct}%</span>
              </span>
              <span
                className="font-display absolute inset-0 z-20 flex items-center justify-center overflow-hidden text-lg tracking-[0.25em] text-cream"
                style={{ clipPath: `inset(0 ${100 - display}% 0 0)` }}
              >
                {pct}%
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.3em] text-subtext">
              <span>The Broker Exchange</span>
              <span>Opening the floor</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
