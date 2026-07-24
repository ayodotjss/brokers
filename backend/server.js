import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))
app.use(express.json())

// return a clean 400 for malformed JSON instead of crashing with a stack trace
app.use((err, _req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body.' })
  }
  next(err)
})

const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
    : null

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, supabase: Boolean(supabase) })
})

app.post('/api/whitelist', async (req, res) => {
  const { wallet, steps } = req.body ?? {}

  if (!wallet || !EVM_ADDRESS_RE.test(String(wallet).trim())) {
    return res.status(400).json({ error: 'A valid EVM wallet address is required.' })
  }
  if (!supabase) {
    return res.status(503).json({ error: 'Whitelist is not open yet. Try again soon.' })
  }

  const { error } = await supabase.from('whitelist_applications').insert({
    wallet: String(wallet).toLowerCase().trim(),
    followed_x: Boolean(steps?.follow),
    reposted: Boolean(steps?.retweet),
    liked: Boolean(steps?.like),
  })

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'This wallet has already applied.' })
    }
    console.error('[whitelist] insert failed:', error.message)
    return res.status(500).json({ error: 'Could not save your application. Try again.' })
  }

  res.status(201).json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`The Broker backend listening on http://localhost:${PORT}`)
  if (!supabase) console.warn('⚠ SUPABASE_URL / SUPABASE_SERVICE_KEY not set — inserts disabled.')
})
