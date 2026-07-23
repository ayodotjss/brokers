# 🧠 Memory Log
> Append-only. Never delete or edit previous entries.
> Initialized: 2026-07-23

---

## [2026-07-23] — The Broker: full site build (preloader, hero, sections, whitelist API)

### Project Status & Decisions
- Built the full "The Broker" NFT landing site from scratch. `frontend/` = Vite + React + Tailwind v4 + motion + Lenis; `backend/` = Node/Express + Supabase.
- Design refs: `ref1.png` (content/brand) + `dfr.png` (hero layout — "CHOOSE YOUR PATH" bottom rail) rendered in brand colours from `fontandtheme.txt` (cream #F4F0BB, primary green #1F4D2B, Bebas Neue + Manrope).
- Preloader: logo rides the loading bar, byte-accurate % counts inside the bar (`src/lib/preload.js` fetches bgvideo + 6 octos + logo + fonts), then clip-path curtain reveal.
- Sections use sticky left nav (`SectionsShell.jsx`) with IntersectionObserver driving active state via Context reducer (`AppContext.jsx` — no ad-hoc hooks per user preference).
- Artwork preview: 2 boxes only (restraint), raw WebGL noise-dissolve shader (`ArtworkCanvas.jsx`, no three.js — kept bundle small), alternating cycle through octo1–6, hover overlay shows trait sheets defined in `src/data/artworks.js`.
- X only, no Discord anywhere (user rule).

### Tech Stack & Tools
- Vite 6, React 18, Tailwind v4 (@tailwindcss/vite, @theme tokens in index.css), motion 12 (`motion/react`), lenis, Express 4, @supabase/supabase-js.
- Vite dev server on :3000 proxies `/api` → backend :5000.

### Problems Solved / Lessons Learned
- [npm --prefix]: cwd is repo root, not frontend/ — must pass `--prefix` for installs/builds in the monorepo folders.
- [Dissolve shader]: single texture + progress state machine (out → swap → in) is simpler than dual-texture crossfade and looks better for "burn in" entrances.

### Goals & Next Steps
- User must create `backend/.env` from `.env.example` (Supabase URL + service role key) and run the SQL in `backend/README.md` to create `whitelist_applications`.
- Placeholder X handle `@TheBrokerNFT` — confirm real handle.
- Possible next: roadmap section (button currently scrolls to whitelist), real mint details in FAQ.

---
