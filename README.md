# Bible Verse Website

A simple, elegant website that displays random Bible verses with themed background images.

## Features

- Random Bible verse display
- Themed background images
- Mobile-responsive design
- Smooth transitions
- One-click verse refresh

## Project Structure

```text
verse/
├── dist/                 # Build output directory
│   └── images/           # Processed images for production
├── files/                # Source files for data preparation
│   └── whole_bible_niv1984.pdf # Source Bible text
├── public/               # Static assets served directly or processed
│   ├── index.html        # Main webpage template
│   ├── app.js            # Frontend logic (processed by esbuild)
│   ├── styles.css        # Base CSS styles (processed by PostCSS)
│   └── images/           # Source background images
├── scripts/              # Build and utility scripts
├── src/                  # Server source code
│   ├── index.js          # Express server
│   └── download-images.js # Image generation script
├── .env                  # Environment variable configuration
├── .env.example          # Environment variable template
├── esbuild-meta.json     # Metadata output from esbuild builds
├── package.json          # Project dependencies and scripts
├── postcss.config.js     # Configuration for PostCSS processor
└── README.md             # This file
```

## Setup

1. **Environment:** Copy `.env.example` to `.env` (if it exists) or create a `.env` file.
    Configure necessary variables (see `.env` section or code).
2. **Install Dependencies:**

    ```bash
    npm install
    ```

3. **Prepare Data:** (If required for initial setup or data changes)
    - Process `files/whole_bible_niv1984.pdf`, possibly fetch images.
        Check `package.json` for scripts (e.g., `prepare`, `extract-verses`).
        Run the appropriate script(s).
4. **Build Assets:**

    ```bash
    npm run build # Or the relevant build script from package.json
    ```

5. **Start the Server:**

    ```bash
    npm start
    ```

6. Visit `http://localhost:3000` (or the configured port) in your browser.

## Scripts

- `npm start`: Starts the Express server on port 3000
- `npm run build`: Builds JS, CSS, optimizes images, and updates sitemap
- `npm run build:static`: Full build + generates static site in `dist/`
- `npm run start:prod`: Starts server in production mode (`NODE_ENV=production`)
- `npm run setup`: Downloads and optimizes background images
- `npm run clean`: Removes generated `verses.json` and `images/`

## Technology Stack

- **Backend:** Node.js with Express 5
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Build Tools:** esbuild (JS bundling), PostCSS (CSS processing), sharp (image optimization)
- **Images:** Local gradient fallbacks, processed to responsive WebP/JPG

## Environment Variables (`.env`)

See `.env.example` for the full list. Key variables:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: `development` or `production`

## Contributing

1. Fork the repository.
2. Create your feature branch.
3. Commit your changes.
4. Push to the branch.
5. Create a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](mdc:LICENSE) file for details.
