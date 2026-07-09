# Deathless Cloud Database

A cloud-backed admin app and JSON API for the **Deathless** D&D campaign site. It stores character profiles and Lucy's travelogue in PostgreSQL (Supabase), with a simple web UI for full CRUD and public read endpoints for a future Node.js front end.

**Live demo (no install required):** https://YOUR-RENDER-APP.onrender.com/admin  
*(Replace with your Render URL. Free-tier apps may take ~30 seconds to wake after idle.)*

## Instructions for Build and Use

Steps to build and/or run the software:

1. Clone this repository and install dependencies: `npm install`
2. Create a free [Supabase](https://supabase.com/) project. In the dashboard, click **Connect**, copy a **Session pooler** URI, replace `[YOUR-PASSWORD]` with your database password, and put it in a `.env` file as `DATABASE_URL=...` (see `.env.example`).
3. Create tables and load seed data: `npm run db:setup` then `npm run seed`
4. Start the server: `npm start`
5. Open http://localhost:3000/admin in a browser

*(Optional — cloud hosting already set up for grading: push to GitHub, create a Render Web Service with build `npm install`, start `npm start`, and set the same `DATABASE_URL` environment variable.)*

Instructions for using the software:

1. Open the live Render URL above (or http://localhost:3000/admin if running locally). If the page is slow the first time, wait for the free service to wake up.
2. From the home page, choose **Manage Profiles** or **Manage Travelogue**.
3. **Profiles:** list, create, edit, or delete characters; add class rows and bio paragraphs (blank line = new paragraph; `<angle brackets>` = Nemah's voice).
4. **Travelogue:** list sessions → open a session → add/edit/delete sections (optional in-game date + paragraph body).
5. To inspect the public API (read-only), visit `/api/profiles` and `/api/travelogue/sessions` on the same host.

## Development Environment

To recreate the development environment, you need the following software and/or libraries with the specified versions:

* Node.js 18 or newer (developed with Node.js 24 / npm 11)
* npm (comes with Node.js)
* A PostgreSQL database via Supabase (free tier) — connection string in `.env` as `DATABASE_URL`
* Project dependencies (installed via `npm install`): express 4.21.x, pg 8.13.x, ejs 3.1.x, dotenv 16.4.x, method-override 3.0.x
* Optional for hosting: a free [Render](https://render.com/) Web Service (Node runtime)

## Useful Websites to Learn More

I found these websites useful in developing this software:

* [Supabase — Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres)
* [Express.js documentation](https://expressjs.com/)
* [node-postgres (pg) documentation](https://node-postgres.com/)
* [Render — Deploy Node apps](https://render.com/docs/deploy-node-express-app)
* [MDN — HTTP / REST basics](https://developer.mozilla.org/en-US/docs/Web/HTTP)
* [Cursor/Claude AI](https://cursor.com/dashboard)

## Future Work

The following items I plan to fix, improve, and/or add to this project in the future:

* [ ] Add password protection (HTTP basic auth) on `/admin` so the URL is not fully public
* [ ] Connect the Deathless public site to `GET /api/profiles` and `GET /api/travelogue/sessions` instead of hard-coded JS (I have a full frontend website coded as part of a project for a different class; making them work together is a little too big for the scope of this project right now)
* [ ] Multi-character commentary: logins mapped to party members, with per-character display styles
* [ ] Optional image upload for profile mugshots (filenames only for now)
