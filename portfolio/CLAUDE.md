# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

`AGENTS.md` (imported above) is the source of truth for audience, tone, design system, page structure and content status. Read it before changing copy or visuals. The notes below cover what it doesn't.

## Commands

```bash
npm run dev       # Vite dev server at http://localhost:5173/
npm run build     # Multi-page production build into ./dist/
npm run preview   # Serve ./dist/ locally to check the production build
```

There is no linter, formatter or test suite. To verify a change, run `npm run build` (it catches broken imports and missing entries), then check the page in `npm run dev` in both light and dark mode and at mobile width.

## Deployment

The live site (aeronjay.me) runs on **Cloudflare Workers** with static assets. This overrides the GitHub Pages notes in `AGENTS.md`.

```bash
npm run build && npx wrangler deploy   # Build, then upload ./dist to the "aeronjay" Worker
```

`wrangler.toml` serves `dist/` as Worker assets (`assets = { directory = "dist" }`), and `wrangler deploy` does not build first, so always run `npm run build` before deploying. Deploying publishes to production. Only deploy when asked.

`.github/workflows/deploy.yml` (GitHub Pages, on push to `main`) and `npm run deploy` (gh-pages) are leftovers and aren't the current production path.

## How the pieces connect

- **One JS entry for every page.** Each HTML file (homepage, `404.html`, every `work/*/index.html`) loads `<script type="module" src="/src/main.js">`. `main.js` imports **all five** stylesheets (including `project-page.css`) and runs every initializer on `DOMContentLoaded`. Pages don't link CSS directly, so a new stylesheet must be imported in `main.js`.
- **Initializers are DOM-ID driven and no-op when the element is missing.** `main.js`/`theme.js` look up `#site-nav`, `#nav-toggle`, `#nav-mobile`, `#theme-toggle`. A new page gets nav/theme behavior only if its markup uses these same IDs. Mobile-menu links need the `.nav__mobile-link` class to close the menu.
- **Theming is split between CSS and JS.** Without a stored preference, no `data-theme` attribute is set and CSS `@media (prefers-color-scheme: dark)` drives colors. Once the user toggles, `theme.js` sets `data-theme` on `<html>` and saves it to `localStorage` (`theme-preference`). Any dark-mode override therefore needs **both** selectors, following the pattern in `styles/components.css` (`[data-theme="dark"] X` and `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) X }`).
- **Scroll reveal.** Add `.reveal` to any element to animate it in. `animations.js` adds `.reveal--visible` and sets a `--reveal-i` stagger index; with reduced motion, everything is revealed immediately.
- **Static assets.** Files in `public/` are served from the site root (`/resume.pdf`, `/profile.jpg`, `/projects/...`). Fonts come from `@fontsource` imports at the top of `styles/index.css`, not from `<link>` tags.
- **Adding a page:** create `<path>/index.html` with its own `<title>`/meta/OG tags and the shared nav markup, load `/src/main.js`, and add an entry to `rollupOptions.input` in `vite.config.js`. Without that entry, the page is missing from the build.
- `dist/` is build output. Don't edit it.
