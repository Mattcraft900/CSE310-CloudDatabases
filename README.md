# Deathless Cloud Database

Admin web app and read-only JSON API for the **Deathless** D&D campaign site — stores character profiles and Lucy's travelogue in a PostgreSQL cloud database (Supabase or Neon).

## Features

- **Admin UI** — full CRUD for profiles (with multi-class rows) and travelogue (sessions + sections)
- **Public API** — `GET /api/profiles`, `GET /api/travelogue/sessions` for the future Deathless Node site
- **Seed scripts** — import from `data/characters.json` and `data/lucys-travelogue.md`

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- A free [Supabase](https://supabase.com/) or [Neon](https://neon.tech/) PostgreSQL database

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Configure database

Copy the example env file and add your connection string:

```bash
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL` to your Supabase/Neon URI. For Supabase, use **Project Settings → Database → Connection string → URI**. For production on Render, prefer the **connection pooler** URL.

### 3. Create tables

```bash
npm run db:setup
```

### 4. Import seed data

Clean the Google Docs export (if you haven't already) and import:

```bash
npm run clean:markdown
npm run seed
```

Or run individually:

```bash
npm run seed:profiles
npm run seed:travelogue
```

### 5. Run locally

```bash
npm start
```

Open [http://localhost:3000/admin](http://localhost:3000/admin)

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/profiles` | All profiles with nested classes |
| GET | `/api/profiles/:id` | Single profile |
| GET | `/api/travelogue/sessions` | All sessions with nested sections |
| GET | `/api/travelogue/sessions/:id` | Single session with sections |

## Deploy to Render (free tier)

1. Push this repo to GitHub.
2. Create a [Render](https://render.com/) **Web Service** connected to the repo.
3. Settings:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Environment:** add `DATABASE_URL` (your Supabase/Neon pooler URI)
4. After deploy, run `npm run db:setup` and `npm run seed` once using Render Shell or locally against the same database.
5. Visit `https://your-app.onrender.com/admin`

> Render free tier sleeps after ~15 minutes idle; the first request may take ~30 seconds to wake.

## Project structure

```
src/
  server.js           Express entry point
  db/schema.sql       PostgreSQL tables
  routes/api.js       Public read API
  routes/admin-*.js   Admin CRUD
  views/              EJS templates
data/
  characters.json     Structured character stats
  lucys-travelogue.md Cleaned Google Doc export
scripts/
  setup-db.js         Apply schema
  seed-profiles.js    Import profiles
  import-travelogue-md.js
```

## Data conventions

- Optional fields use SQL `NULL`, not empty strings.
- Bio and travelogue content is stored as **jsonb paragraph arrays**.
- Voice markup uses `<angle brackets>` for Nemah; parsed at display time on the public site.

## Development Environment

| Software | Version |
|----------|---------|
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 15+ (via Supabase/Neon) |

## Useful links

- [Supabase Docs](https://supabase.com/docs)
- [Express.js](https://expressjs.com/)
- [Render Docs](https://render.com/docs)

## Future work

- [ ] HTTP basic auth on `/admin` routes
- [ ] Connect Deathless WDD131 site to `/api/*`
- [ ] Image upload (optional; filenames only for now)
