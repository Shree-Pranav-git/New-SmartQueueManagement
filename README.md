# Smart Queue & Appointment Management System

This repo contains:

- `frontend/`: static HTML/CSS/JS site (deploy as **Render Static Site**)
- `backend/`: Java Servlet backend (deploy as **Render Web Service** using Docker/Tomcat)
- `supabase.sql`: schema to run in Supabase SQL editor

## Supabase (Postgres) setup

1. Create a Supabase project.
2. Run `supabase.sql` in the Supabase SQL editor.

## Deploy backend on Render

1. Create a Render **Web Service** from the `backend/` folder repo.
2. Choose **Docker** environment (Render will build using `backend/Dockerfile`).
3. Add environment variables (from Supabase Database settings):

- `DB_HOST`
- `DB_PORT` (usually `5432`)
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

Backend endpoints:

- `/api/book` (POST)
- `/api/queue` (GET)
- `/api/admin` (GET, POST)

## Deploy frontend on Render

1. Create a Render **Static Site** from the same repo (or a separate repo).
2. Set publish directory to `frontend`.
3. Update `frontend/script.js` and set `API_BASE_URL` to your backend Render URL.

