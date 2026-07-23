import { useEffect } from 'react'
import Lenis from 'lenis'
import { AppProvider, useApp } from './context/AppContext'
import Preloader from './components/Preloader'
import Hero from './components/Hero'
import SectionsShell from './components/SectionsShell'

function Site() {
  const { appRevealed } = useApp()

  // smooth scroll — only once the site is live
  useEffect(() => {
    document.body.style.overflow = appRevealed ? '' : 'hidden'
    if (!appRevealed) return

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
    let raf
    const loop = (time) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [appRevealed])

  return (
    <>
      <Preloader />
      <Hero />
      {appRevealed && <SectionsShell />}
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Site />
    </AppProvider>
  )
}
