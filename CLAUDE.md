# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev` (Vite)
- **Build:** `npm run build` (runs `tsc && vite build`)
- **Preview production build:** `npm run preview`
- **No test runner is configured.**

## Architecture

React 18 + TypeScript + Vite SPA that browses TMDB movies and TV series.

### Path alias

`@/*` maps to `src/*` (configured in both `tsconfig.json` and `vite.config.ts`). All imports use this alias.

### Provider tree (src/main.tsx)

`BrowserRouter` → `ApiProvider` (RTK Query) → `ThemeProvider` → `GlobalContextProvider` → `LazyMotion` → `App`

### Routing (src/App.tsx)

All pages are lazy-loaded with `React.lazy` + `Suspense`. Routes:
- `/` → Home (hero slider + sections)
- `/:category` → Catalog (paginated grid, where category is "movie" or "tv")
- `/:category/:id` → Detail (movie/series info, cast, videos, similar)
- `*` → NotFound

### State management

- **TMDB API:** RTK Query (`src/services/TMDB.ts`) with two endpoints: `getShows` (list/search/similar) and `getShow` (detail with `append_to_response=videos,credits`).
- **Theme:** React Context (`src/context/themeContext.tsx`) persisted to `localStorage`. Uses Tailwind `darkMode: "class"` — toggles `dark` class on `<html>`.
- **Global UI:** React Context (`src/context/globalContext.tsx`) for sidebar visibility and video modal state.

### Key patterns

- **Class merging:** Use `cn()` from `src/utils/helper.ts` (clsx + tailwind-merge) for all conditional class names.
- **localStorage helpers:** `saveTheme`/`getTheme` in `src/utils/helper.ts`. New persistence follows this pattern.
- **Navigation:** `navLinks` array in `src/constants/index.ts` drives both Header (desktop) and SideBar (mobile) — adding an entry auto-renders in both.
- **Shared styles:** Reusable Tailwind class strings exported from `src/styles/index.ts` (e.g., `maxWidth`, `textColor`).
- **Dark/light theming:** All components use Tailwind `dark:` variants. The theme defaults to "Dark" when no saved preference exists.

### Types (src/types.d.ts)

- `IMovie` — TMDB movie/series (uses `original_title` for movies, `name` for TV)
- `INavLink` — nav link with `title`, `path`, `icon` (react-icons component)
- `ITheme` — theme option with `title` and `icon`

### Environment

Requires `.env` with `VITE_API_KEY` (TMDB API key) and `VITE_TMDB_API_BASE_URL`.
