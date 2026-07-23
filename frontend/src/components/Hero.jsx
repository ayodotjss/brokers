import { motion } from 'motion/react'
import { useApp } from '../context/AppContext'
import { XIcon, ArrowIcon, BookIcon, PenIcon } from './Icons'

const EASE = [0.22, 1, 0.36, 1]

function reveal(delay = 0) {
  return {
    initial: { y: 48, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 1, ease: EASE, delay },
  }
}

function SideMarquee({ side }) {
  // two identical stacks so the -50% loop is seamless
  const stack = Array.from({ length: 8 })
  const logos = (
    <div className="marquee-track flex flex-col items-center gap-10 py-6">
      {[...stack, ...stack].map((_, i) => (
        <span key={i} className="marquee-logo h-10 w-10 opacity-40 sm:h-12 sm:w-12" aria-hidden />
      ))}
    </div>
  )
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 z-1 hidden overflow-hidden bg-[#0d2414] sm:block sm:w-24 lg:w-28 ${
        side === 'left' ? 'left-0' : 'right-0'
      }`}
    >
      {logos}
      {/* inner edge fade so the column melts into the video */}
      <div
        className={`absolute inset-y-0 w-10 ${
          side === 'left'
            ? 'right-0 bg-linear-to-r from-[#0d2414] to-transparent'
            : 'left-0 bg-linear-to-l from-[#0d2414] to-transparent'
        }`}
      />
    </div>
  )
}

function PathCard({ icon, title, desc, delay, onClick }) {
  return (
    <motion.button
      {...reveal(delay)}
      onClick={onClick}
      className="group flex w-full items-center gap-5 rounded-2xl border border-cream/25 bg-primary/35 p-3 text-left backdrop-blur-md transition-colors duration-300 hover:border-secondary/70 hover:bg-primary/55 sm:p-6"
    >
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-secondary/50 text-secondary transition-transform duration-300 group-hover:scale-110">
        {icon}
      </span>
      <span className="flex-1">
        <span className="font-display block text-2xl tracking-wide text-cream">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-cream/70">{desc}</span>
      </span>
      <span className="text-secondary transition-transform duration-300 group-hover:translate-x-1.5">
        <ArrowIcon className="h-5 w-5" />
      </span>
    </motion.button>
  )
}

export default function Hero() {
  const { appRevealed } = useApp()

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  if (!appRevealed) {
    // keep the video mounted (and buffering) behind the preloader
    return (
      <section className="relative h-svh overflow-hidden bg-primary">
        <video src="/bgvideo.mp4" autoPlay muted loop playsInline className="h-full w-full object-cover" />
      </section>
    )
  }

  return (
    <section className="grain relative flex h-svh flex-col overflow-hidden bg-primary">
      {/* background video, always covering, softly zooming */}
      <motion.video
        src="/bgvideo.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1.18 }}
        animate={{ scale: 1.04 }}
        transition={{ duration: 2.2, ease: EASE }}
      />

      {/* flanking brand marquees — sit over the video's black side bars,
          behind the gradient overlay. Green octopi drift bottom → top. */}
      <SideMarquee side="left" />
      <SideMarquee side="right" />

      {/* brand-toned gradient wash for legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d2414]/90 via-[#0d2414]/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d2414]/95 via-transparent to-[#0d2414]/60" />

      {/* nav */}
      <motion.header
        {...reveal(0.15)}
        className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10"
      >
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="The Broker" className="h-9 w-9 object-contain brightness-0 invert" />
          <span className="font-display text-xl tracking-[0.18em] text-cream">THE BROKER</span>
        </div>
        <a
          href="https://x.com/theoctobroker"
          target="_blank"
          rel="noreferrer"
          aria-label="The Broker on X"
          className="grid h-10 w-10 place-items-center rounded-full border border-cream/30 text-cream transition-all duration-300 hover:border-secondary hover:text-secondary"
        >
          <XIcon className="h-4 w-4" />
        </a>
      </motion.header>

      {/* headline block — ref1 copy, dfr layout */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 sm:px-10 lg:px-16">
        <div className="max-w-2xl">
          <motion.p
            {...reveal(0.35)}
            className="text-xs font-bold uppercase tracking-[0.35em] text-secondary sm:text-sm"
          >
            Not all heroes wear capes.
          </motion.p>
          <h1 className="font-display mt-3 leading-[0.9] text-cream">
            <motion.span {...reveal(0.45)} className="block text-[17vw] sm:text-8xl lg:text-9xl">
              SOME WEAR
            </motion.span>
            <motion.span
              {...reveal(0.55)}
              className="block text-[17vw] text-secondary sm:text-8xl lg:text-9xl"
            >
              SUITS.
            </motion.span>
          </h1>
          <motion.p {...reveal(0.7)} className="mt-5 max-w-md text-base leading-relaxed text-cream/80 sm:text-lg">
            1,500 octopus financial professionals, suited up and headed for {' '}
            <span className="font-semibold text-secondary">Robinhood</span>.
          </motion.p>
        </div>
      </div>

      {/* choose your path — dfr-style bottom rail */}
      <div className="relative z-10 px-6 pb-6 sm:px-10 sm:pb-8 lg:px-16">
        <motion.div
          {...reveal(0.85)}
          className="flourish mx-auto max-w-4xl text-cream/70"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.4em]">Choose your path</span>
        </motion.div>
        <div className="mx-auto mt-4 grid max-w-4xl gap-4 sm:grid-cols-2">
          <PathCard
            icon={<BookIcon className="h-6 w-6" />}
            title="ABOUT"
            desc="Who these octopi are and why they all look so tired."
            delay={0.95}
            onClick={() => scrollTo('about')}
          />
          <PathCard
            icon={<PenIcon className="h-6 w-6" />}
            title="APPLY FOR WHITELIST"
            desc="Get on the early list. 1,500 spots total, that's it."
            delay={1.05}
            onClick={() => scrollTo('whitelist')}
          />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="mt-5 flex justify-center"
        >
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="text-[10px] font-bold uppercase tracking-[0.4em] text-cream/50"
          >
            Scroll to explore ↓
          </motion.span>
        </motion.div>
      </div>
    </section>
  )
}
