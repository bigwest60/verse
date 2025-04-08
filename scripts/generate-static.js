import fs from 'fs';
import path from 'path';

// Read verses data
const versesData = JSON.parse(fs.readFileSync('public/verses.json', 'utf8'));
const { verses } = versesData;

// Create dist directory
const distDir = 'dist';
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy static assets
const staticFiles = [
  'styles.min.css',
  'app.min.js',
  'help.html',
  'icon-192.png',
  'icon-512.png',
  'icon.svg',
  'apple-touch-icon.png',
  'apple-touch-icon-precomposed.png',
  'manifest.json'
];

staticFiles.forEach(file => {
  if (fs.existsSync(`public/${file}`)) {
    fs.copyFileSync(`public/${file}`, `dist/${file}`);
  }
});

// Copy images directory if it exists
if (fs.existsSync('public/images')) {
  fs.cpSync('public/images', 'dist/images', { recursive: true });
}

// Create verses.js with the verses data
const versesJs = `window.VERSES = ${JSON.stringify(verses, null, 2)};`;
fs.writeFileSync('dist/verses.js', versesJs);

// Get list of available theme images
const availableThemes = new Set();
if (fs.existsSync('public/images')) {
  fs.readdirSync('public/images').forEach(file => {
    const match = file.match(/^bg-(.+?)(?:-dark)?\.jpg$/);
    if (match) {
      availableThemes.add(match[1]);
    }
  });
}

// Create themes.js with the list of available themes
const themesJs = `window.AVAILABLE_THEMES = ${JSON.stringify(Array.from(availableThemes))};`;
fs.writeFileSync('dist/themes.js', themesJs);

// Generate index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Daily Bible verses with beautiful backgrounds">
  <title>Daily Verse</title>
  <link rel="stylesheet" href="styles.min.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📖</text></svg>">
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#4a5568">
  <link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
  <link rel="apple-touch-icon" href="icon-192.png">
  
  <style>
    .verse-theme {
      display: block !important;
      visibility: visible !important;
      opacity: 0.7 !important;
      color: white !important;
      padding: 8px !important;
      text-align: center !important;
      font-size: 14px !important;
      margin: 0 0 20px 0 !important;
      font-weight: normal !important;
      width: 100% !important;
      box-sizing: border-box !important;
      text-transform: uppercase !important;
      letter-spacing: 2px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    }
    
    .verse-card {
      position: relative !important;
      z-index: 5 !important;
    }
  </style>
  
  <!-- Prevent PWA installation prompts -->
  <meta name="mobile-web-app-capable" content="no">
  <meta name="apple-mobile-web-app-capable" content="no">
</head>
<body>
  <div class="background-layer" id="bg-layer-1"></div>
  <div class="background-layer" id="bg-layer-2"></div>
  <div class="background-overlay"></div>
  <div class="app-container">
    <header>
      <button id="themeToggle" aria-label="Toggle dark mode">
        <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>
      <button id="shareBtn" aria-label="Share verse" class="share-button">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-6l-4-4m0 0L8 6m4-4v13" />
        </svg>
      </button>
      <a href="help.html" class="help-button" aria-label="Help">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z" />
        </svg>
      </a>
    </header>
    <main>
      <div class="verse-card" id="verseCard">
        <p class="verse-theme">LOADING...</p>
        <p class="verse-text" id="verse-text">Loading verse...</p>
        <p class="verse-reference" id="verse-reference"></p>
        <button class="button" type="button" id="newVerseBtn">New Verse</button>
      </div>
    </main>
  </div>
  
  <script>
    // Prevent service worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }
  </script>
  <script src="themes.js"></script>
  <script src="verses.js"></script>
  <script src="app.min.js"></script>
  
  <noscript>
    <style>
      .verse-card { opacity: 1 !important; }
      .button { display: none; }
    </style>
    <div class="app-container">
      <main>
        <div class="verse-card">
          <p class="verse-theme">THEME UNAVAILABLE</p>
          <p>Please enable JavaScript to view daily verses.</p>
        </div>
      </main>
    </div>
  </noscript>
</body>
</html>`;

fs.writeFileSync('dist/index.html', indexHtml);

console.log('Static site generated in dist/ directory'); 