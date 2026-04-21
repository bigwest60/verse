# Verse - Copilot Instructions

## Project Overview

Bible verse website (dailyverse.online) using Express 5 server with ESM modules, esbuild bundling, and PostCSS. Static site generation to `dist/` for deployment.

## Build & Run Commands

- **Dev server:** `npm start` (runs `node src/index.js`, port 3000)
- **Production server:** `npm run start:prod` (sets `NODE_ENV=production`)
- **Full build:** `npm run build` — runs JS, CSS, image optimization, and sitemap in sequence
- **Build JS:** `npm run build:js` — esbuild bundles `public/app.js` → `public/app-[hash].js`
- **Build CSS:** `npm run build:css` — PostCSS processes `public/styles.css` → `public/styles-[hash].min.css`
- **Optimize images:** `npm run optimize:images` — sharp generates responsive WebP/JPG at 480/768/1080/1920
- **Static site:** `npm run build:static` — builds then generates `dist/` via `scripts/generate-static.js`
- **Serve static:** `npm run serve:static` — serves `dist/` via `npx serve`
- **Dead code analysis:** `npm run knip`
- **Setup images:** `npm run setup` — downloads and optimizes images
- **Clean:** `npm run clean` — removes `public/verses.json` and `public/images`

## Architecture

### Dual-Mode Serving

The server (`src/index.js`) operates in two modes:
- **Development:** serves raw assets from `public/` (unhashed `app.js`, `styles.css`)
- **Production:** reads hashed asset filenames from manifest files (`esbuild-meta.json` for JS, `scripts/.css-manifest.txt` for CSS) and injects them into HTML via `<!-- CSS_FILENAME -->` / `<!-- JS_FILENAME -->` placeholder replacement in `public/index.html`

### Build Pipeline

1. `build:js` — esbuild bundles `public/app.js` with content hashing, outputs `esbuild-meta.json`
2. `build:css` — PostCSS pipes through autoprefixer + cssnano, then `scripts/hash-css.js` reads stdin, hashes the content, writes `styles-[hash].min.css` and records the filename in `scripts/.css-manifest.txt`
3. `optimize:images` — sharp creates responsive variants of `public/images/bg-*.jpg` at 4 breakpoints in WebP + JPG formats
4. `build:sitemap` — updates `<lastmod>` dates in `public/sitemap.xml` from file mtimes

### Static Site Generation

`scripts/generate-static.js` assembles `dist/` by:
1. Cleaning and recreating `dist/`
2. Reading hashed filenames from the manifest files
3. Processing `index.html` and `help.html` templates (replacing CSS/JS placeholders)
4. Copying assets (JS, CSS, manifest, verses.json, icons, images)

### Frontend

Single-page client in `public/app.js` (no framework):
- Fetches verses from `/verses.json` (direct JSON fetch, not the `/api/verse` endpoint)
- Dual-layer background crossfade (two `div.bg-layer` elements swapping)
- Theme-aware responsive images: `bg-{themeSlug}-{dark|light}-{size}.{webp|jpg}`
- Dark/light mode via `data-theme` attribute + `localStorage` + `prefers-color-scheme` media query
- Keyboard shortcuts: Space (new verse), T (toggle theme), S (share), H/? (help)

### Data

`public/verses.json` contains `{ "verses": [...] }` where each verse has `text`, `reference`, and `theme` fields. The server also exposes `/api/verse` (random verse via shuffled queue) and `/api/verse/meta` (count + theme list).

## Key Conventions

- **ESM throughout:** `"type": "module"` in package.json. Use `import`/`export`. CommonJS files use `.cjs` extension (e.g., `update-sitemap.cjs`).
- **Content-hashed production assets:** CSS filenames include an 8-char SHA-256 hash; JS filenames use esbuild's `[hash]` entry names. Both are tracked in manifest files for server-side injection.
- **Image naming convention:** Source images in `public/images/` follow `bg-{theme}[-dark].jpg`. Optimized variants append size: `bg-{theme}-{480|768|1080|1920}.{webp|jpg}`.
- **CSS theming:** Uses CSS custom properties on `:root` (light) and `[data-theme="dark"]` (dark). Color scheme is declared via `color-scheme: light dark`.
- **Dead code analysis:** `npm run knip`
- **`__dirname` pattern:** Since ESM doesn't provide `__dirname`, files use `fileURLToPath(import.meta.url)` + `path.dirname()` to get it.
- **License:** MIT. `package.json` declares `"license": "MIT"` and `LICENSE` contains the full MIT text.