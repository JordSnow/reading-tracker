# Munin — Claude Project Instructions

## What is Munin?

A personal reading tracker PWA. Named after Odin's raven of memory (Norse mythology). Targets BookTok (@muninreads). Dark, minimal, opinionated design. Do not suggest rebuilding from scratch.

---

## Tech Stack

| Layer      | Tool                                       |
| ---------- | ------------------------------------------ |
| Framework  | React + Vite                               |
| Styling    | Tailwind CSS                               |
| Database   | PGlite (in-browser Postgres via IndexedDB) |
| Routing    | React Router                               |
| Search     | Fuse.js (fuzzy)                            |
| Animations | canvas-confetti                            |
| PWA        | vite-plugin-pwa                            |
| Deployment | Netlify (auto-deploy on git push)          |

---

## Project Structure

```
src/
  pages/          # Home, Shelf, Table, Library, Roll, Stats, BookDetail
  components/     # ConfirmModal, SortControl
  db/db.js        # PGlite init + all query functions
  constants.js    # TILE_COLOURS, GOOGLE_BOOKS_KEY
```

---

## Design System

- **Background:** `#1a1a1a` (dark charcoal)
- **Accent:** `#E8682A` (burnt orange)
- **Font:** DM Sans extralight (weight 200)
- **Cards:** Glassmorphism style
- **Nav:** Floating pill bottom nav, 5 items — Home · Shelf · 🎲 Roll (centre) · Library · Stats
- **CSS variables** defined in `index.css`
- **Safe area handling** for iPhone PWA

---

## Database Schema — `books` table

```
id, title, author, status (Shelf/Table/Library),
page_count, genre, notes, roll_eligible, is_unreleased,
added_to_shelf_date, started_date, current_page, completed_date,
rating, randomly_rolled, series_name, series_number, is_standalone,
cover_i, cover_url, release_year
```

---

## Book Search & Covers

- **API:** Google Books
- **Key:** `VITE_GOOGLE_BOOKS_KEY` in `.env` + Netlify env vars
- **Cover helper:** `getCoverUrl(book, size)` in `db.js`
  - Handles `cover_url` (Google Books) and `cover_i` (Open Library legacy)
  - Falls back to coloured tile from `TILE_COLOURS`

---

## Pages & Features

### Shelf

Grid view. Sort/filter chips, fuzzy search (Fuse.js), genre filter dropdown. Multi-select add via Google Books. Progress overlay. Start reading modal.

### Table

Current read. Cover hero, progress bar. Finish with rating + backdated date. Put back on shelf.

### Library

Completed books grid. Star ratings. Sort/filter chips. Genre + year filter.

### Roll

Slot machine carousel. Genre filter chips. Confetti on selection. Reroll.

### Stats

3 tabs: All Time / Yearly / Monthly. Bar chart, averages, roll success rate.

### BookDetail

Full-screen slide-in from right. Edit: genre, notes, roll eligible, rating, dates. Delete with confirm modal.

### Home

(In progress — see to-do)

---

## Components

- **ConfirmModal** — reusable destructive action confirmation
- **SortControl** — pill chip style sort/filter selector

---

## Splash Screen

Munin feather SVG draws in → wordmark reveals left to right. Tied to PGlite DB init completing.

---

## Dev Workflow

```bash
npm run dev          # local dev
npm run build        # production build
git add . && git commit -m "message" && git push  # deploys to Netlify
```

---

## To-Do (priority order)

1. **Supabase migration** — auth + cloud DB (biggest priority)
2. Manual book adding (no API)
3. Genre presets in BookDetail
4. Pull to refresh
5. Swipe to delete on cards
6. Home search bar (shows which status the book is in)
7. Confetti on reading milestones (gamification)
8. Random quote from notes on Home screen
9. Desktop layout
10. Yearly Wrapped
11. AI book recommendations (Anthropic API)
12. Gamification / achievements
13. Consider Cloudflare Pages when Netlify credits run low

---

## Conventions & Notes

- Each chat covers **one feature or session**. Update this file when significant changes are made.
- Keep all DB logic in `db/db.js`. Don't scatter queries into components.
- Status values are exactly: `"Shelf"`, `"Table"`, `"Library"` — match these strings precisely.
- Don't add new dependencies without checking if existing ones cover the need first (e.g. Fuse.js already handles search, canvas-confetti already handles animations).
- Tailwind only — no inline styles or separate CSS files except `index.css` for CSS variables.
