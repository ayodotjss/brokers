import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useApp } from '../../context/AppContext'
import { API_BASE } from '../../lib/api'
import { XIcon, RetweetIcon, HeartIcon, WalletIcon, CheckIcon, LockIcon } from '../Icons'

const EASE = [0.22, 1, 0.36, 1]
const X_PROFILE = 'https://x.com/theoctobroker'

// social steps must be done in order — each one sends you to X and only
// completes once you come back to the site.
const STEPS = [
  { key: 'follow', icon: <XIcon className="h-4 w-4" />, label: 'Follow @theoctobroker on X', cta: 'Follow' },
  { key: 'retweet', icon: <RetweetIcon className="h-4 w-4" />, label: 'Repost the pinned post', cta: 'Repost' },
  { key: 'like', icon: <HeartIcon className="h-4 w-4" />, label: 'Like the pinned post', cta: 'Like' },
]

function StepRow({ n, icon, label, state, cta, pending, onAction }) {
  const done = state === 'done'
  const locked = state === 'locked'
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: EASE, delay: n * 0.08 }}
      className={`flex items-center gap-3 rounded-xl border p-4 transition-all duration-300 sm:gap-4 sm:p-5 ${
        locked
          ? 'border-line/60 bg-card/50 opacity-55'
          : 'border-line bg-card shadow-broker'
      }`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-extrabold transition-colors duration-300 ${
          done ? 'bg-primary text-cream' : locked ? 'bg-line text-subtext' : 'bg-secondary/30 text-primary'
        }`}
      >
        {done ? <CheckIcon /> : locked ? <LockIcon className="h-3.5 w-3.5" /> : n}
      </span>
      <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-primary sm:grid">
        {icon}
      </span>
      <span className={`flex-1 text-sm font-semibold ${locked ? 'text-subtext' : 'text-ink'}`}>{label}</span>
      <button
        type="button"
        onClick={onAction}
        disabled={done || locked || pending}
        className={`shrink-0 rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
          done
            ? 'cursor-default bg-secondary/25 text-primary'
            : locked
              ? 'cursor-not-allowed bg-line/70 text-subtext'
              : 'bg-primary text-cream hover:bg-accent'
        }`}
      >
        {done ? 'Done ✓' : locked ? 'Locked' : pending ? 'Waiting…' : cta}
      </button>
    </motion.div>
  )
}

export default function Whitelist() {
  const { wlSteps, wlStatus, wlMessage, dispatch } = useApp()
  const [wallet, setWallet] = useState('')
  const [pending, setPending] = useState(null) // step waiting for you to return
  const leftRef = useRef(false)

  // the active step is the first one not yet done; everything after it is locked
  const activeKey = STEPS.find((s) => !wlSteps[s.key])?.key
  const allDone = !activeKey

  // detect leaving to X and coming back — that return marks the step complete
  useEffect(() => {
    const onLeave = () => {
      if (pending) leftRef.current = true
    }
    const onReturn = () => {
      if (pending && leftRef.current) {
        dispatch({ type: 'WL_STEP', step: pending })
        setPending(null)
        leftRef.current = false
      }
    }
    const onVis = () => (document.visibilityState === 'hidden' ? onLeave() : onReturn())

    window.addEventListener('blur', onLeave)
    window.addEventListener('focus', onReturn)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('blur', onLeave)
      window.removeEventListener('focus', onReturn)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [pending, dispatch])

  const startStep = (key) => {
    if (pending || key !== activeKey) return
    leftRef.current = false
    setPending(key)
    window.open(X_PROFILE, '_blank', 'noopener')
  }

  const stateOf = (key) => {
    if (wlSteps[key]) return 'done'
    if (key === activeKey) return 'active'
    return 'locked'
  }

  const submit = async (e) => {
    e.preventDefault()
    if (wlStatus === 'sending' || wlStatus === 'success') return
    if (!allDone) {
      dispatch({ type: 'WL_STATUS', value: 'error', message: 'Finish the steps on X first.' })
      return
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet.trim())) {
      dispatch({ type: 'WL_STATUS', value: 'error', message: 'Enter a valid EVM wallet address (0x…).' })
      return
    }
    dispatch({ type: 'WL_STATUS', value: 'sending' })
    try {
      const res = await fetch(`${API_BASE}/api/whitelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: wallet.trim(), steps: wlSteps }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Try again.')
      dispatch({
        type: 'WL_STATUS',
        value: 'success',
        message: 'Application received. Welcome to the floor.',
      })
    } catch (err) {
      dispatch({ type: 'WL_STATUS', value: 'error', message: err.message })
    }
  }

  const walletLocked = !allDone || wlStatus === 'success'

  return (
    <section id="whitelist" className="min-h-screen border-t border-line px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative"
      >
        <img
          src="/logo.png"
          alt=""
          className="pointer-events-none absolute -top-6 right-0 hidden h-32 w-32 rotate-12 object-contain opacity-[0.07] lg:block"
        />
        <h2 className="font-display text-5xl tracking-wide text-primary sm:text-6xl">
          APPLY FOR WHITELIST
        </h2>
        <div className="mt-3 flex items-center gap-3 text-primary">
          <span className="h-px w-14 bg-primary/40" />
          <img src="/logo.png" alt="" className="h-5 w-5 object-contain" />
          <span className="h-px w-14 bg-primary/40" />
        </div>
        <p className="mt-5 max-w-md leading-relaxed text-subtext">
          One step at a time. Each opens X, and the next unlocks once you're back. Drop your wallet
          at the end.
        </p>
      </motion.div>

      <form onSubmit={submit} className="mt-10 max-w-2xl space-y-3.5">
        {STEPS.map((s, i) => (
          <StepRow
            key={s.key}
            n={i + 1}
            icon={s.icon}
            label={s.label}
            cta={s.cta}
            state={stateOf(s.key)}
            pending={pending === s.key}
            onAction={() => startStep(s.key)}
          />
        ))}

        {/* wallet — the final step, unlocks only after all three */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.24 }}
          className={`flex flex-col gap-3 rounded-xl border p-4 transition-all duration-300 sm:flex-row sm:items-center sm:gap-4 sm:p-5 ${
            walletLocked && !allDone ? 'border-line/60 bg-card/50 opacity-55' : 'border-line bg-card shadow-broker'
          }`}
        >
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
              allDone ? 'bg-secondary/30 text-primary' : 'bg-line text-subtext'
            }`}
          >
            {allDone ? '4' : <LockIcon className="h-3.5 w-3.5" />}
          </span>
          <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-primary sm:grid">
            <WalletIcon className="h-4 w-4" />
          </span>
          <span className={`flex-1 text-sm font-semibold ${allDone ? 'text-ink' : 'text-subtext'}`}>
            Submit your wallet address
          </span>
          <input
            type="text"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder={allDone ? '0x…' : 'Finish the steps first'}
            spellCheck={false}
            autoComplete="off"
            disabled={walletLocked}
            className="w-full min-w-0 rounded-lg border border-line bg-cream/50 px-3.5 py-2 font-mono text-sm text-ink outline-none transition-colors duration-300 placeholder:text-subtext/60 focus:border-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-60"
          />
        </motion.div>

        <motion.button
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
          type="submit"
          disabled={!allDone || wlStatus === 'sending' || wlStatus === 'success'}
          className={`group inline-flex w-full items-center justify-center gap-3 rounded-full px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] shadow-broker transition-all duration-300 sm:w-auto ${
            wlStatus === 'success'
              ? 'cursor-default bg-secondary text-primary'
              : allDone
                ? 'bg-primary text-cream hover:bg-accent hover:shadow-broker-lg'
                : 'cursor-not-allowed bg-primary/40 text-cream/70'
          }`}
        >
          {wlStatus === 'sending'
            ? 'Submitting…'
            : wlStatus === 'success'
              ? 'Application Received ✓'
              : 'Submit Application'}
          {wlStatus === 'idle' && allDone && (
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          )}
        </motion.button>

        {wlMessage && (
          <p className={`text-sm font-semibold ${wlStatus === 'error' ? 'text-red-700' : 'text-primary'}`}>
            {wlMessage}
          </p>
        )}
      </form>
    </section>
  )
}
