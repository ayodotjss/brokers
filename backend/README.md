# The Broker — Backend

Minimal Node/Express API that stores whitelist applications in Supabase.

## Setup

1. Copy `.env.example` to `.env` and fill in your Supabase project URL + **service role** key.
2. Create the table in the Supabase SQL editor:

```sql
create table if not exists whitelist_applications (
  id uuid primary key default gen_random_uuid(),
  wallet text not null unique check (wallet ~ '^0x[a-f0-9]{40}$'),
  followed_x boolean default false,
  reposted boolean default false,
  liked boolean default false,
  created_at timestamptz default now()
);

-- service role bypasses RLS, but keep the table locked for anon access
alter table whitelist_applications enable row level security;
```

3. Run:

```bash
npm install
npm run dev
```

## Endpoints

| Method | Path             | Body                                             | Notes                        |
| ------ | ---------------- | ------------------------------------------------ | ---------------------------- |
| GET    | `/api/health`    | —                                                | liveness + supabase status   |
| POST   | `/api/whitelist` | `{ wallet, steps: { follow, retweet, like } }`   | EVM address; 409 on duplicate |

The frontend dev server (Vite, port 3000) proxies `/api/*` to `http://localhost:5000`.
