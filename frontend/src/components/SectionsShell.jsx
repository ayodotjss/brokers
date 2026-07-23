import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { XIcon, BookIcon, PenIcon, FaqIcon } from './Icons'
import About from './sections/About'
import Whitelist from './sections/Whitelist'
import Faq from './sections/Faq'

const NAV = [
  { id: 'about', label: 'ABOUT', icon: <BookIcon className="h-4 w-4" /> },
  { id: 'whitelist', label: 'APPLY FOR WL', icon: <PenIcon className="h-4 w-4" /> },
  { id: 'faq', label: 'FAQ', icon: <FaqIcon className="h-4 w-4" /> },
]

function NavRail() {
  const { activeSection } = useApp()

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <aside className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur-md lg:h-screen lg:w-52 lg:shrink-0 lg:border-b-0 lg:border-r lg:bg-transparent lg:backdrop-blur-0">
      <div className="flex items-center gap-3 px-4 py-2.5 lg:h-full lg:flex-col lg:items-start lg:gap-0 lg:px-7 lg:py-10">
        {/* brand */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex shrink-0 items-center gap-2.5 lg:mb-12 lg:flex-col lg:items-start lg:gap-3"
        >
          <img src="/logo.png" alt="" className="h-7 w-7 object-contain lg:h-11 lg:w-11" />
          <span className="font-display hidden text-base tracking-[0.18em] text-primary sm:block lg:text-lg">
            THE BROKER
          </span>
        </button>

        {/* nav items */}
        <nav className="flex flex-1 items-center gap-1.5 overflow-x-auto lg:flex-col lg:items-stretch lg:gap-2.5 lg:overflow-visible">
          {NAV.map((item) => {
            const active = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] transition-all duration-300 lg:px-3.5 lg:py-2 ${
                  active
                    ? 'border-primary bg-primary text-cream shadow-broker'
                    : 'border-transparent text-subtext hover:border-line hover:text-primary'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* socials — X only */}
        <a
          href="https://x.com/theoctobroker"
          target="_blank"
          rel="noreferrer"
          aria-label="The Broker on X"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-primary transition-all duration-300 hover:border-primary hover:bg-primary hover:text-cream lg:mt-auto"
        >
          <XIcon className="h-3.5 w-3.5" />
        </a>
      </div>
    </aside>
  )
}

export default function SectionsShell() {
  const { dispatch } = useApp()

  // watch which section owns the viewport → drives the left nav
  useEffect(() => {
    const sections = ['about', 'whitelist', 'faq']
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) dispatch({ type: 'SET_SECTION', value: entry.target.id })
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [dispatch])

  return (
    <div className="relative flex flex-col bg-cream lg:flex-row">
      <NavRail />
      <main className="min-w-0 flex-1">
        <About />
        <Whitelist />
        <Faq />
        <footer className="border-t border-line px-6 py-8 text-center text-xs font-semibold uppercase tracking-[0.3em] text-subtext">
          © {new Date().getFullYear()} The Broker. The Market. Our World.
        </footer>
      </main>
    </div>
  )
}
