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
  'styles.css'
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

// Read and modify app.js
let appJs = fs.readFileSync('public/app.js', 'utf8');

// Replace the setThemeText function to check for available themes
appJs = appJs.replace(
  /\/\*\*\s*\n\s*\* Update theme text and background[\s\S]*?}(?=\s*\/\*\*|$)/m,
  `/**
 * Update theme text and background
 * @param {string} theme
 */
function setThemeText(theme) {
  log('Setting theme:', {
    value: theme,
    type: typeof theme,
    length: theme?.length,
    isUndefined: theme === undefined,
    isEmpty: theme === ''
  });
  
  if (!elements.verseTheme) {
    console.error('Theme element not found');
    return;
  }
  
  elements.verseTheme.classList.add('fade-out');
  
  setTimeout(() => {
    // Only show loading text if theme is explicitly undefined
    const text = theme === undefined ? 'loading' : 
                 theme === '' ? 'error' :
                 theme.toLowerCase();
                 
    elements.verseTheme.textContent = text;
    elements.verseTheme.classList.remove('fade-out');
    
    log('Theme text set to:', {
      text: text,
      elementContent: elements.verseTheme.textContent,
      elementVisible: elements.verseTheme.offsetParent !== null
    });

    // Set background image based on theme
    if (theme && theme !== '') {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const themeHasImage = window.AVAILABLE_THEMES.includes(theme.toLowerCase());
      
      if (themeHasImage) {
        const imagePath = '/images/bg-' + theme.toLowerCase() + (isDarkMode ? '-dark' : '') + '.jpg';
        
        // Create new image to preload
        const img = new Image();
        
        img.onerror = () => {
          useGradientFallback(isDarkMode, theme);
        };
        
        img.onload = () => {
          // Set the new image on the pseudo-element first
          document.body.style.setProperty('--next-bg-image', 'url("' + imagePath + '")');
          document.body.classList.add('loading-bg');
          
          // After transition completes, update main background
          setTimeout(() => {
            document.body.style.backgroundImage = 'url("' + imagePath + '")';
            document.body.classList.remove('loading-bg');
          }, 500);
        };
        
        img.src = imagePath;
        
        log('Background image:', {
          path: imagePath,
          isDarkMode: isDarkMode,
          theme: theme.toLowerCase()
        });
      } else {
        useGradientFallback(isDarkMode, theme);
      }
    } else {
      // Clear background image if no theme
      document.body.style.backgroundImage = '';
      document.body.style.setProperty('--next-bg-image', 'none');
      log('Background image cleared');
    }
  }, config.fadeDelay / 2);
}

function useGradientFallback(isDarkMode, theme) {
  // If image fails to load or theme has no image, create a fallback gradient
  const gradientColors = isDarkMode ? 
    ['#1a202c', '#2d3748'] : // Dark mode gradient
    ['#f7fafc', '#edf2f7']; // Light mode gradient
    
  document.body.style.backgroundImage = 'linear-gradient(135deg, ' + gradientColors[0] + ', ' + gradientColors[1] + ')';
  document.body.style.setProperty('--next-bg-image', 'none');
  log('Using fallback gradient for theme:', theme);
}`
);

// Replace the fetchVerse function implementation while keeping the rest of the file intact
appJs = appJs.replace(
  /\/\*\*\s*\n\s*\* Fetch and display a new verse[\s\S]*?}(?=\s*\/\*\*|$)/m,
  `/**
 * Fetch and display a new verse
 */
async function fetchVerse() {
  log('Starting fetchVerse');
  
  if (!elements.verseCard || elements.verseCard.classList.contains('loading')) {
    log('Already loading or card not found');
    return;
  }
  
  elements.verseCard.classList.add('loading');
  if (elements.newVerseBtn) {
    elements.newVerseBtn.disabled = true;
  }
  
  // Add fade-out classes
  elements.verseText.classList.add('fade-out');
  elements.verseRef.classList.add('fade-out');
  
  try {
    // Get random verse from local data
    const verse = window.VERSES[Math.floor(Math.random() * window.VERSES.length)];
    log('Selected verse:', verse);
    
    // Update theme immediately
    if (verse && typeof verse.theme === 'string') {
      log('Found valid theme:', verse.theme);
      setThemeText(verse.theme);
    } else {
      log('Invalid theme:', verse);
      setThemeText('');
    }
    
    // Update verse text and reference after fade out
    setTimeout(() => {
      if (elements.verseText) {
        elements.verseText.textContent = verse.text || 'Error: No verse text';
        elements.verseText.classList.remove('fade-out');
        log('Updated verse text to:', elements.verseText.textContent);
      }
      
      if (elements.verseRef) {
        elements.verseRef.textContent = verse.reference || '';
        elements.verseRef.classList.remove('fade-out');
        log('Updated verse reference to:', elements.verseRef.textContent);
      }
      
      // Remove loading state
      elements.verseCard.classList.remove('loading');
      if (elements.newVerseBtn) {
        elements.newVerseBtn.disabled = false;
      }
    }, config.fadeDelay);
    
  } catch (error) {
    console.error('Error in fetchVerse:', error);
    log('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    setTimeout(() => {
      if (elements.verseText) {
        elements.verseText.textContent = 'Error loading verse. Please try again.';
        elements.verseText.classList.remove('fade-out');
      }
      if (elements.verseRef) {
        elements.verseRef.textContent = '';
        elements.verseRef.classList.remove('fade-out');
      }
      setThemeText('');
      
      // Remove loading state
      elements.verseCard.classList.remove('loading');
      if (elements.newVerseBtn) {
        elements.newVerseBtn.disabled = false;
      }
    }, config.fadeDelay);
  }
  
  log('Finished fetchVerse');
}`
);

fs.writeFileSync('dist/app.js', appJs);

// Generate index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Daily Bible verses with beautiful backgrounds">
  <title>Daily Verse</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="data:,">
  
  <style>
    #verse-theme {
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
  <div class="app-container">
    <main>
      <div class="verse-card">
        <p id="verse-theme">LOADING...</p>
        <p class="verse-text" id="verse-text">Loading verse...</p>
        <p class="verse-reference" id="verse-reference"></p>
        <button class="button" type="button">New Verse</button>
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
  <script src="app.js"></script>
  
  <noscript>
    <style>
      .verse-card { opacity: 1 !important; }
      .button { display: none; }
    </style>
    <div class="app-container">
      <main>
        <div class="verse-card">
          <p id="verse-theme">THEME UNAVAILABLE</p>
          <p>Please enable JavaScript to view daily verses.</p>
        </div>
      </main>
    </div>
  </noscript>
</body>
</html>`;

fs.writeFileSync('dist/index.html', indexHtml);

console.log('Static site generated in dist/ directory'); 