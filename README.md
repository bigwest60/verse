# Verse — Bible Verse Website

A simple, elegant website that displays random Bible verses with themed background images. Live at [dailyverse.online](https://dailyverse.online).

## Features

- Random Bible verse display with theme-based backgrounds
- Dark/light mode (auto-detects system preference, toggle with keyboard or button)
- Dual-layer background crossfade with responsive WebP/JPG images
- Mobile-responsive design
- Keyboard shortcuts: `Space` (new verse), `T` (toggle theme), `S` (share), `H`/`?` (help)
- Server API endpoints: `/api/verse` (random verse), `/api/verse/meta` (count + themes)
- Static site generation for deployment

## Project Structure

```text
verse/
├── dist/                    # Static site output (generated)
│   └── images/              # Processed responsive images
├── files/                   # Source data files
│   └── whole_bible_niv1984.pdf
├── public/                  # Static assets (served directly or processed)
│   ├── index.html           # Main page template
│   ├── help.html            # Keyboard shortcuts help page
│   ├── app.js               # Frontend logic (bundled by esbuild)
│   ├── styles.css           # Base CSS (processed by PostCSS)
│   ├── verses.json          # Verse data (generated)
│   └── images/              # Source background images
├── scripts/                 # Build and utility scripts
│   ├── generate-static.js   # Static site generator
│   ├── hash-css.js          # CSS content hashing
│   ├── optimize-images.js   # Responsive image generation (sharp)
│   └── update-sitemap.cjs   # Sitemap lastmod updater
├── src/                     # Server source code
│   ├── index.js             # Express 5 server
│   └── download-images.js   # Background image downloader
├── esbuild-meta.json        # esbuild metadata (generated)
├── package.json
├── postcss.config.js
└── README.md
```

## Setup

1. **Install dependencies:**

    ```bash
    npm install
    ```

    The `prepare` script runs automatically after install, downloading and optimizing background images.

2. **Build assets:**

    ```bash
    npm run build
    ```

3. **Start the server:**

    ```bash
    npm start
    ```

4. Visit `http://localhost:3000` in your browser.

## Scripts

| Script | Description |
|---|---|
| `npm start` | Start Express server (port 3000) |
| `npm run start:prod` | Start server in production mode |
| `npm run build` | Build JS + CSS + optimize images + update sitemap |
| `npm run build:js` | Bundle and minify `app.js` with esbuild (content-hashed output) |
| `npm run build:css` | Process CSS with PostCSS (autoprefixer + cssnano + content hashing) |
| `npm run optimize:images` | Generate responsive WebP/JPG images at 4 breakpoints |
| `npm run build:sitemap` | Update `<lastmod>` dates in `sitemap.xml` |
| `npm run build:static` | Full build + generate static site in `dist/` |
| `npm run static` | Generate static site from current build |
| `npm run serve:static` | Serve `dist/` with `serve` |
| `npm run setup` | Download and optimize background images |
| `npm run clean` | Remove generated `verses.json` and `images/` |
| `npm run knip` | Dead code analysis |

## Technology Stack

- **Backend:** Node.js ≥18 with Express 5, Helmet
- **Frontend:** Vanilla HTML, CSS, JavaScript (no framework)
- **Build:** esbuild (JS bundling + content hashing), PostCSS (autoprefixer + cssnano), sharp (responsive images)
- **Deployment:** Static site generation to `dist/`

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | `development` or `production` | `development` |
| `DEBUG` | Enable verbose logging | Auto-enabled in dev |

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[MIT](LICENSE) © Bill
