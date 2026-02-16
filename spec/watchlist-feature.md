# Watchlist Feature Spec

## 1. Overview

Add a watchlist feature that lets users bookmark movies and TV series for later viewing. Watchlist data persists in `localStorage` so it survives page reloads without requiring authentication or a backend.

## 2. Data Model

```ts
// Addition to src/types.d.ts

export interface IWatchlistItem extends IMovie {
  category: string; // "movie" | "tv" — needed to build the detail link (/:category/:id)
}
```

The watchlist is stored as an array: `IWatchlistItem[]`.

- `category` is required because `IMovie` doesn't carry it, and we need it to link back to `/:category/:id`.

## 3. Requirements

### Functional

| # | Requirement |
|---|-------------|
| F1 | Users can add a movie/series to the watchlist from `MovieCard` and the `Detail` page. |
| F2 | Users can remove an item from the watchlist using the same toggle button. |
| F3 | The toggle button visually indicates whether an item is already in the watchlist (filled vs outline bookmark icon). |
| F4 | Watchlist data persists in `localStorage` across page reloads. |
| F5 | A dedicated `/watchlist` page displays all saved items as a grid of `MovieCard` components. |
| F6 | An empty watchlist page shows a friendly message (e.g., "Your watchlist is empty"). |
| F7 | A "watchlist" nav link appears in the Header and Sidebar alongside existing links. |

### Non-Functional

| # | Requirement |
|---|-------------|
| NF1 | No new dependencies — use only what the project already has (React Context, react-icons, React Router, Tailwind, Framer Motion). |
| NF2 | Follow existing code patterns (context shape, helper functions, lazy loading, `cn()` utility). |
| NF3 | Support both dark and light themes using existing Tailwind `dark:` variants. |
| NF4 | Watchlist route must not conflict with the existing `/:category` catch-all route. |

## 4. Design Approach

### 4.1 Context — `src/context/watchlistContext.tsx`

Mirrors `themeContext.tsx`:

- **State:** `watchlist: IWatchlistItem[]` initialized from `localStorage` via a helper.
- **Actions:**
  - `addToWatchlist(item: IWatchlistItem)` — adds if not already present.
  - `removeFromWatchlist(id: string)` — filters out by `id`.
  - `isInWatchlist(id: string): boolean` — lookup helper for toggle buttons.
- **Persistence:** a `useEffect` syncs `watchlist` to `localStorage` on every change, using new `saveWatchlist` / `getWatchlist` helpers.
- **Export:** `useWatchlist()` hook (mirrors `useTheme()`).

### 4.2 Persistence — `src/utils/helper.ts`

Add two functions alongside existing `saveTheme` / `getTheme`:

```ts
export const saveWatchlist = (watchlist: IWatchlistItem[]) => {
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
};

export const getWatchlist = (): IWatchlistItem[] => {
  const data = localStorage.getItem("watchlist");
  return data ? JSON.parse(data) : [];
};
```

### 4.3 Toggle Button on `MovieCard` and `Detail`

- **Icon:** `BsBookmark` (outline) / `BsBookmarkFill` (filled) from `react-icons/bs` (already installed).
- **MovieCard:** A small bookmark button in the top-right corner of the card, visible on hover (similar to the existing YouTube icon overlay pattern).
- **Detail page:** A bookmark button next to the title or in the hero section.
- Both call `addToWatchlist` or `removeFromWatchlist` based on `isInWatchlist(id)`.
- `e.preventDefault()` + `e.stopPropagation()` on the MovieCard button to avoid navigating to the detail page when clicking the bookmark.

### 4.4 Watchlist Page — `src/pages/Watchlist/index.tsx`

- Reads `watchlist` from `useWatchlist()`.
- Renders items in a grid using existing `MovieCard` components.
- Shows an empty state when `watchlist.length === 0`.
- Styled consistently with the `Catalog` page layout (uses `maxWidth` from `styles/index.ts`).

### 4.5 Routing — `src/App.tsx`

```tsx
const Watchlist = lazy(() => import("./pages/Watchlist"));

<Routes>
  <Route path="/"              element={<Home />} />
  <Route path="/watchlist"     element={<Watchlist />} />   {/* BEFORE /:category */}
  <Route path="/:category/:id" element={<Detail />} />
  <Route path="/:category"     element={<Catalog />} />
  <Route path="*"              element={<NotFound />} />
</Routes>
```

`/watchlist` is placed **before** `/:category` so React Router matches the literal path first, avoiding the catch-all.

### 4.6 Navigation — `src/constants/index.ts`

```ts
import { BsBookmark } from "react-icons/bs";

export const navLinks: INavLink[] = [
  { title: "home",      path: "/",          icon: AiOutlineHome },
  { title: "movies",    path: "/movie",     icon: TbMovie },
  { title: "tv series", path: "/tv",        icon: MdOutlineLiveTv },
  { title: "watchlist", path: "/watchlist",  icon: BsBookmark },
];
```

The Header and Sidebar already iterate over `navLinks`, so the new entry renders automatically in both.

### 4.7 Provider — `src/main.tsx`

Wrap `WatchlistProvider` inside the existing provider tree:

```tsx
<ThemeProvider>
  <WatchlistProvider>          {/* NEW */}
    <GlobalContextProvider>
      <LazyMotion features={domAnimation}>
        <App />
      </LazyMotion>
    </GlobalContextProvider>
  </WatchlistProvider>
</ThemeProvider>
```

## 5. Tech Stack

All existing — no new dependencies:

| Concern | Tool |
|---------|------|
| State management | React Context (`useContext` + `useState`) |
| Persistence | `localStorage` |
| Icons | `react-icons` (bs, ai, tb, md, fi — already installed) |
| Routing | React Router v6 (`Route`, `lazy`) |
| Styling | Tailwind CSS with `dark:` variants + `cn()` utility |
| Code splitting | `React.lazy` + `Suspense` |

## 6. Implementation Phases

### Phase 1: Context + Persistence

**Files:** `types.d.ts`, `helper.ts`, `watchlistContext.tsx`, `main.tsx`

- Define `IWatchlistItem` in `types.d.ts`.
- Add `saveWatchlist` / `getWatchlist` to `helper.ts`.
- Create `watchlistContext.tsx` with `addToWatchlist`, `removeFromWatchlist`, `isInWatchlist`.
- Wrap app with `WatchlistProvider` in `main.tsx`.

**Test checkpoint:** Open DevTools console. Verify the provider renders without errors. Manually call context actions via a temporary test button or React DevTools to confirm `localStorage` read/write works.

### Phase 2: Toggle Buttons

**Files:** `MovieCard/index.tsx`, `Detail/index.tsx`

- Add bookmark toggle to `MovieCard` (top-right, hover-visible).
- Add bookmark toggle to `Detail` hero section.
- Both use `useWatchlist()` to check state and dispatch add/remove.

**Test checkpoint:** Browse movies, click bookmarks, verify filled/outline icon toggles correctly. Reload the page — icons should reflect persisted state. Confirm clicking the bookmark on a MovieCard does **not** navigate to the detail page.

### Phase 3: Watchlist Page + Nav Link

**Files:** `Watchlist/index.tsx`, `constants/index.ts`, `App.tsx`

- Create the `Watchlist` page component with grid layout and empty state.
- Add `watchlist` entry to `navLinks` in `constants/index.ts`.
- Add `/watchlist` route to `App.tsx` (before `/:category`).

**Test checkpoint:** Click the "watchlist" nav link in Header and Sidebar. Verify the page loads with bookmarked items. Remove items from the watchlist page and confirm the grid updates. Verify empty state displays when all items are removed.

## 7. File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `src/context/watchlistContext.tsx` | Watchlist state management + persistence |
| `src/pages/Watchlist/index.tsx` | Watchlist page component |

### Modified Files

| File | Change |
|------|--------|
| `src/types.d.ts` | Add `IWatchlistItem` interface |
| `src/utils/helper.ts` | Add `saveWatchlist` / `getWatchlist` functions |
| `src/main.tsx` | Wrap app with `WatchlistProvider` |
| `src/constants/index.ts` | Add watchlist nav link to `navLinks` array |
| `src/App.tsx` | Add `/watchlist` lazy route before `/:category` |
| `src/common/MovieCard/index.tsx` | Add bookmark toggle button |
| `src/pages/Detail/index.tsx` | Add bookmark toggle button |

## 8. Testing Checkpoints

| Phase | What to Verify | How |
|-------|---------------|-----|
| 1 | Provider mounts, no console errors | Open app, check DevTools console |
| 1 | localStorage read/write | Add item via React DevTools or temp button, check `localStorage.getItem("watchlist")` |
| 2 | Bookmark icon toggles (outline/filled) | Click bookmark on any MovieCard or Detail page |
| 2 | State persists across reload | Bookmark an item, reload, verify icon is still filled |
| 2 | MovieCard click doesn't navigate | Click the bookmark icon on a MovieCard, confirm you stay on the same page |
| 3 | Nav link appears in Header + Sidebar | Visual check on desktop and mobile viewports |
| 3 | Watchlist page renders saved items | Navigate to `/watchlist`, verify grid shows bookmarked movies |
| 3 | Empty state | Remove all items, verify empty message appears |
| 3 | Remove from watchlist page | Click bookmark on an item in the watchlist grid, verify it disappears |
| 3 | Route doesn't conflict with `/:category` | Navigate to `/movie`, `/tv` — confirm they still work correctly |
