import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'

const MARKETS = [
  { ticker: 'NVDA', name: 'Nvidia', sector: 'Technology', move: 8.2, backing: 31 },
  { ticker: 'ETH', name: 'Ethereum', sector: 'Crypto', move: 6.1, backing: 18 },
  { ticker: 'JPM', name: 'JPMorgan', sector: 'Finance', move: 4.0, backing: 22 },
  { ticker: 'XOM', name: 'ExxonMobil', sector: 'Energy', move: 1.7, backing: 12 },
  { ticker: 'SPY', name: 'S&P 500 ETF', sector: 'ETF', move: -0.8, backing: 17 },
]

const REWARDS = [
  { label: 'Every staked Broker', value: 50 },
  { label: 'First-place market', value: 30 },
  { label: 'Second-place market', value: 12 },
  { label: 'Third-place market', value: 5 },
  { label: 'Streaks & achievements', value: 3 },
]

const RULES = [
  { title: 'The selection window', note: 'Holders choose one of the listed reference assets and assign an OctoBroker to that market desk.' },
  { title: 'The weekly lock', note: 'Every position locks when the round begins, so nobody can switch desks after prices start moving.' },
  { title: 'Market settlement', note: 'Verified opening and closing prices determine the percentage change for every reference asset.' },
  { title: 'Reward distribution', note: 'Every staked Broker earns a base share. The top three desks receive additional rewards.' },
]

function Arrow({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function MarketDesk() {
  const [selected, setSelected] = useState(0)
  const market = MARKETS[selected]
  const estimatedReward = useMemo(() => {
    const baseShare = 5000 / 100
    const rankPool = selected === 0 ? 3000 : selected === 1 ? 1200 : selected === 2 ? 500 : 0
    return (baseShare + rankPool / market.backing).toFixed(2)
  }, [market, selected])

  return (
    <section id="market-desk" className="mx-auto grid max-w-7xl gap-6 px-5 py-16 md:px-8 lg:grid-cols-[1.15fr_.85fr] lg:py-24">
      <div>
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Weekly market selection</p>
            <h2 className="font-display mt-2 text-5xl text-primary sm:text-6xl">Choose a market desk</h2>
          </div>
          <span className="hidden rounded-full border border-primary/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary sm:block">Sample week</span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-broker">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-line bg-primary px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-cream/60 sm:px-6">
            <span>Reference asset</span><span>Move</span><span className="w-16 text-right">Backed by</span>
          </div>
          {MARKETS.map((item, index) => (
            <button
              key={item.ticker}
              onClick={() => setSelected(index)}
              aria-pressed={selected === index}
              className={`grid w-full grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-line px-4 py-4 text-left transition last:border-0 sm:px-6 ${selected === index ? 'bg-secondary/25' : 'hover:bg-cream/45'}`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className={`font-display grid h-11 w-14 shrink-0 place-items-center rounded-lg text-lg tracking-wider ${selected === index ? 'bg-primary text-cream' : 'bg-cream text-primary'}`}>{item.ticker}</span>
                <span className="min-w-0"><span className="block truncate text-sm font-bold text-ink">{item.name}</span><span className="block text-[11px] text-subtext">{item.sector}</span></span>
              </span>
              <span className={`font-display text-xl ${item.move >= 0 ? 'text-primary' : 'text-[#9b3f3f]'}`}>{item.move > 0 ? '+' : ''}{item.move.toFixed(1)}%</span>
              <span className="w-16 text-right text-xs font-semibold text-subtext">{item.backing}%</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-subtext">The figures in this example are illustrative and explain how the weekly ranking works. They are not live market prices.</p>
      </div>

      <motion.aside key={market.ticker} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-primary p-6 text-cream shadow-broker-lg sm:p-8">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border-[36px] border-secondary/10" />
        <div className="relative">
          <img src="/octos7.png" alt="OctoBroker in a navy suit" className="mx-auto mt-8 aspect-square w-48 rounded-3xl object-cover shadow-2xl sm:w-56" />
          <div className="mt-7 flex items-end justify-between border-b border-cream/20 pb-5">
            <div><p className="text-xs uppercase tracking-[0.2em] text-cream/50">Broker #007 backs</p><p className="font-display mt-1 text-4xl text-secondary">{market.ticker}</p></div>
            <div className="max-w-44 text-right"><p className="text-xs text-cream/50">Illustrative reward</p><p className="font-display text-xl sm:text-2xl">{estimatedReward} $OCTOBROKER</p></div>
          </div>
          <p className="mt-5 text-sm leading-7 text-cream/70">Once a weekly desk locks, the Broker stays with that reference asset until the round closes. Percentage change decides the ranking.</p>
          <div className="mt-6 flex w-full items-center justify-center rounded-xl border border-cream/15 bg-cream/10 px-5 py-3.5 text-sm font-bold text-cream/70">Position locks when the weekly round begins</div>
        </div>
      </motion.aside>
    </section>
  )
}

export default function ExchangePage() {
  useEffect(() => {
    document.title = 'The Broker Exchange | How it works'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b border-cream/15 bg-primary text-cream">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <a href="/" className="flex items-center gap-3"><img src="/logo.png" alt="" className="h-9 w-9 brightness-0 invert" /><span className="font-display text-xl tracking-[0.16em]">THE BROKER</span></a>
          <div className="flex items-center gap-5 text-xs font-bold uppercase tracking-[0.16em]"><a href="#how-it-works" className="hidden text-cream/65 transition hover:text-secondary sm:block">How it works</a><a href="/" className="flex items-center gap-2 rounded-full border border-cream/25 px-4 py-2 transition hover:border-secondary hover:text-secondary">Main site <Arrow className="h-4 w-4" /></a></div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden bg-primary px-5 pb-16 pt-14 text-cream md:px-8 lg:pb-24 lg:pt-20">
          <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-[1fr_330px]">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-secondary"><span className="h-2 w-2 rounded-full bg-secondary" /> NFT staking powered by market performance</div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-secondary">The Broker Exchange</p>
              <h1 className="font-display mt-3 max-w-4xl text-[18vw] leading-[.82] tracking-wide sm:text-8xl lg:text-9xl">PUT YOUR BROKER<br /><span className="text-secondary">ON THE MARKET.</span></h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-cream/70 sm:text-lg">The Broker Exchange is a weekly NFT staking game where each OctoBroker backs a real market reference asset. The market moves. The desks rank. The best calls earn more.</p>
              <a href="#market-desk" className="mt-8 inline-flex items-center gap-3 rounded-xl bg-secondary px-6 py-4 text-sm font-extrabold text-primary transition hover:bg-cream">Choose a market desk <Arrow className="h-5 w-5" /></a>
            </div>
            <div className="rounded-3xl border border-cream/15 bg-[#163a21] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">The weekly loop</p>
              {['Connect & stake', 'Pick a market', 'Lock for the week', 'Settle by % change'].map((step, i) => <div key={step} className="flex items-center gap-4 border-b border-cream/10 py-4 last:border-0"><span className="font-display text-3xl text-secondary/45">0{i + 1}</span><span className="text-sm font-semibold">{step}</span></div>)}
            </div>
          </div>
        </section>

        <MarketDesk />

        <section className="border-y border-line bg-card px-5 py-16 md:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.75fr_1.25fr]">
            <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Weekly rewards</p><h2 className="font-display mt-2 text-5xl text-primary sm:text-6xl">How the pool is split</h2><p className="mt-5 max-w-md text-sm leading-7 text-subtext">Participation earns a base share. Better market calls earn a larger slice, with an additional allocation for streaks and achievements.</p></div>
            <div className="space-y-5">{REWARDS.map((reward) => <div key={reward.label}><div className="mb-2 flex justify-between text-sm font-bold"><span>{reward.label}</span><span>{reward.value}%</span></div><div className="h-3 overflow-hidden rounded-full bg-cream"><motion.div initial={{ width: 0 }} whileInView={{ width: `${reward.value}%` }} viewport={{ once: true }} transition={{ duration: .8 }} className="h-full rounded-full bg-primary" /></div></div>)}</div>
          </div>
        </section>

        <section id="how-it-works" className="bg-[#0d2414] px-5 py-16 text-cream md:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.25em] text-secondary">Round mechanics</p><h2 className="font-display mt-2 text-5xl sm:text-6xl">One week on the exchange.</h2><p className="mt-5 text-sm leading-7 text-cream/60">Each round follows the same sequence, from choosing a market desk to distributing $OCTOBROKER after prices settle.</p></div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">{RULES.map((item, i) => <div key={item.title} className="rounded-2xl border border-cream/12 bg-white/[.04] p-6"><span className="font-display text-2xl text-secondary">0{i + 1}</span><h3 className="mt-8 text-lg font-bold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-cream/55">{item.note}</p></div>)}</div>
          </div>
        </section>

        <section className="px-5 py-16 text-center md:px-8 lg:py-24"><img src="/logo.png" alt="The Broker" className="mx-auto h-16 w-16" /><h2 className="font-display mt-5 text-5xl text-primary sm:text-7xl">Stake your Broker.<br />Choose your market. Beat the week.</h2><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-subtext">Reference assets are used only to score the game. Backing a stock, ETF or cryptocurrency does not give a player ownership of that asset.</p><a href="https://x.com/theoctobroker" target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 font-bold text-primary underline decoration-secondary decoration-2 underline-offset-4">Follow The OctoBroker on X <Arrow className="h-4 w-4" /></a></section>
      </main>
      <footer className="border-t border-line px-5 py-7 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-subtext">Copyright {new Date().getFullYear()} The Broker / The Broker Exchange</footer>
    </div>
  )
}
