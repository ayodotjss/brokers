import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { PlusIcon } from '../Icons'

const EASE = [0.22, 1, 0.36, 1]

const FAQS = [
  {
    q: 'What is The Broker?',
    a: 'A collection of 1,500 octopus financial professionals. They wear suits, carry briefcases, and take the market very seriously. The market does not always return the favor.',
  },
  {
    q: 'How many NFTs are in the collection?',
    a: "1,500. That number is final. We'd rather run a small floor than pad the supply.",
  },
  {
    q: 'What makes The Broker unique?',
    a: 'Every trait is hand drawn, and each Broker has a mood you can actually read. Some have quiet confidence. At least one is clearly having the worst trading day of his life.',
  },
  {
    q: 'What are the utilities?',
    a: "Holders get first access to whatever ships next on the Robinhood. We'd rather build first and announce after, so no promises about a metaverse.",
  },
  {
    q: 'When is the mint?',
    a: 'No date yet. It goes up on X first, and whitelist mints before the public does.',
  },
  {
    q: 'How do I stay updated?',
    a: "One channel: @theoctobroker on X. No Discord, no newsletter. If it isn't posted there, it isn't real.",
  },
]

function FaqItem({ item, open, onToggle, index }) {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.06 }}
      className="overflow-hidden rounded-xl border border-line bg-card shadow-broker"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-bold text-ink sm:text-base">{item.q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary/25 text-primary"
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-subtext">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="border-t border-line px-6 py-16 sm:px-10 lg:min-h-screen lg:px-14 lg:py-24">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <h2 className="font-display text-5xl tracking-wide text-primary sm:text-6xl">FAQ</h2>
        <div className="mt-3 flex items-center gap-3 text-primary">
          <span className="h-px w-14 bg-primary/40" />
          <img src="/logo.png" alt="" className="h-5 w-5 object-contain" />
          <span className="h-px w-14 bg-primary/40" />
        </div>
      </motion.div>

      <div className="mt-10 max-w-2xl space-y-3">
        {FAQS.map((item, i) => (
          <FaqItem
            key={item.q}
            item={item}
            index={i}
            open={open === i}
            onToggle={() => setOpen(open === i ? -1 : i)}
          />
        ))}
      </div>
    </section>
  )
}
