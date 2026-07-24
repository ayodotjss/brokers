import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ARTWORKS } from '../../data/artworks'
import ArtworkCanvas from '../ArtworkCanvas'

const EASE = [0.22, 1, 0.36, 1]
const CYCLE_MS = 7000

function TraitOverlay({ artwork }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-[#0d2414]/95 via-[#0d2414]/70 to-[#0d2414]/20 p-5"
    >
      <motion.p
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="font-display mb-3 text-xl tracking-[0.15em] text-secondary"
      >
        {artwork.name}
      </motion.p>
      <div className="space-y-1">
        {Object.entries(artwork.traits).map(([key, value], i) => (
          <motion.div
            key={key}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: EASE, delay: 0.05 + i * 0.04 }}
            className="flex items-baseline justify-between gap-4 border-b border-cream/10 pb-1 text-[12px]"
          >
            <span className="font-bold uppercase tracking-[0.18em] text-cream/50">{key}</span>
            <span className="font-semibold text-cream">{value}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function TraitModal({ artwork, onClose }) {
  // touch: a full readable sheet so every trait is visible, not clipped in a tiny card
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0d2414]/70 p-4 backdrop-blur-sm sm:items-center"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[88vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-broker-lg"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-primary/85 text-cream backdrop-blur-sm"
        >
          ✕
        </button>
        <img src={artwork.src} alt={artwork.name} className="aspect-square w-full shrink-0 object-cover" />
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <p className="font-display mb-3 text-2xl tracking-[0.12em] text-primary">{artwork.name}</p>
          <div className="space-y-1.5">
            {Object.entries(artwork.traits).map(([key, value]) => (
              <div
                key={key}
                className="flex items-baseline justify-between gap-4 border-b border-line pb-1.5 text-sm"
              >
                <span className="font-bold uppercase tracking-[0.14em] text-subtext">{key}</span>
                <span className="font-semibold text-ink">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ArtworkBox({ index, isOpen, canHover, onOpen, onClose, onToggle, className = '' }) {
  const artwork = ARTWORKS[index]

  // hover devices reveal on hover; touch devices toggle on tap. Binding both
  // on touch makes the tap open-then-close itself, so we split by capability.
  const handlers = canHover
    ? { onMouseEnter: onOpen, onMouseLeave: onClose }
    : { onClick: onToggle }

  return (
    <div
      className={`group relative aspect-square w-full cursor-pointer select-none overflow-hidden rounded-2xl border border-line bg-card shadow-broker ${className}`}
      {...handlers}
    >
      <ArtworkCanvas src={artwork.src} />
      {/* corner tag */}
      <span className="font-display absolute left-3 top-3 rounded-md bg-primary/85 px-2 py-0.5 text-xs tracking-[0.2em] text-cream backdrop-blur-sm sm:left-4 sm:top-4 sm:px-2.5 sm:py-1 sm:text-sm">
        {artwork.name}
      </span>
      {/* tap hint — touch only */}
      {!canHover && (
        <span className="absolute bottom-3 right-3 rounded-full bg-primary/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-cream backdrop-blur-sm">
          Tap
        </span>
      )}
      {/* desktop: hover overlay inside the card */}
      {canHover && <AnimatePresence>{isOpen && <TraitOverlay artwork={artwork} />}</AnimatePresence>}
    </div>
  )
}

// six slots feeding three galleries:
//   pos 0,1 → right column (desktop + mobile)
//   pos 2,3 → mobile-only extra under the right column
//   pos 4,5 → desktop-only extra under the About copy
const BOX_COUNT = 6

export default function About() {
  // each slot holds a pool index. Boxes take turns dissolving to the next piece.
  const [slots, setSlots] = useState([0, 1, 2, 3, 4, 5])
  const [tick, setTick] = useState(0)
  const [openBox, setOpenBox] = useState(null) // which box is showing traits
  const cursorRef = useRef(BOX_COUNT) // next pool index to introduce

  const canHover = useMemo(
    () => (typeof window !== 'undefined' ? window.matchMedia('(hover: hover)').matches : true),
    [],
  )

  // keep the cycle from swapping the art while someone is reading a card
  const openRef = useRef(null)
  useEffect(() => {
    openRef.current = openBox
  }, [openBox])

  useEffect(() => {
    const t = setInterval(() => {
      if (openRef.current !== null) return
      setTick((n) => n + 1)
    }, CYCLE_MS / 2)
    return () => clearInterval(t)
  }, [])

  // advance one box per tick to the next pool image not currently on screen,
  // so no two boxes ever show the same broker at once
  useEffect(() => {
    if (tick === 0) return
    setSlots((prev) => {
      const box = (tick - 1) % BOX_COUNT
      let idx = cursorRef.current % ARTWORKS.length
      let guard = 0
      while (prev.includes(idx) && guard < ARTWORKS.length) {
        idx = (idx + 1) % ARTWORKS.length
        guard++
      }
      cursorRef.current = idx + 1
      const next = [...prev]
      next[box] = idx
      return next
    })
  }, [tick])

  const boxProps = (pos) => ({
    index: slots[pos],
    isOpen: openBox === pos,
    canHover,
    onOpen: () => setOpenBox(pos),
    onClose: () => setOpenBox(null),
    onToggle: () => setOpenBox((cur) => (cur === pos ? null : pos)),
  })

  // lock the page behind the touch modal so it doesn't scroll away
  const modalOpen = !canHover && openBox !== null
  useEffect(() => {
    if (!modalOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [modalOpen])

  return (
    <section id="about" className="px-6 py-16 sm:px-10 lg:min-h-screen lg:px-14 lg:py-24">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <h2 className="font-display text-5xl tracking-wide text-primary sm:text-6xl">
          ABOUT THE BROKER
        </h2>
        <div className="mt-3 flex items-center gap-3 text-primary">
          <span className="h-px w-14 bg-primary/40" />
          <img src="/logo.png" alt="" className="h-5 w-5 object-contain" />
          <span className="h-px w-14 bg-primary/40" />
        </div>
      </motion.div>

      <div className="mt-12 grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        {/* copy */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          className="max-w-xl"
        >
          <p className="font-display text-2xl leading-snug tracking-wide text-ink sm:text-3xl">
            1,500 unique NFTs.
            <br />
            Every one a financial professional.
          </p>
          <div className="mt-6 space-y-4 leading-relaxed text-subtext">
            <p>
              Inspired by the world of finance, The Broker is an original NFT collection set in a
              world where intelligent octopus brokers run the financial markets. Every Broker is
              uniquely designed with expressive personalities, premium business attire, and
              collectible traits.
            </p>
            <p className="font-semibold text-ink">
              Welcome to The Broker Exchange, where every deal begins.
            </p>
          </div>

          {/* desktop-only second gallery, sitting in the copy column's dead space */}
          <div className="mt-10 hidden lg:block">
            <div className="flourish text-primary">
              <span className="text-[11px] font-bold uppercase tracking-[0.4em]">From The Vault</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-6">
              {[4, 5].map((pos) => (
                <ArtworkBox key={pos} {...boxProps(pos)} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* artwork preview — dissolve boxes */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        >
          <div className="flourish text-primary">
            <span className="text-[11px] font-bold uppercase tracking-[0.4em]">
              Artwork Preview
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:gap-6">
            {[0, 1, 2, 3].map((pos) => (
              <ArtworkBox
                key={pos}
                {...boxProps(pos)}
                // boxes 3 & 4 are the mobile-only extra gallery
                className={pos > 1 ? 'lg:hidden' : ''}
              />
            ))}
          </div>
          <p className="mt-4 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-subtext">
            {canHover ? 'Hover a broker to read its file' : 'Tap a broker to read its file'}
          </p>
        </motion.div>
      </div>

      {/* touch: full readable trait sheet */}
      <AnimatePresence>
        {modalOpen && (
          <TraitModal artwork={ARTWORKS[slots[openBox]]} onClose={() => setOpenBox(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}
