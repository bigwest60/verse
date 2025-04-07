// Cache DOM elements
const elements = {
  verseText: document.getElementById('verse-text'),
  verseRef: document.getElementById('verse-reference'),
  verseTheme: document.getElementById('verse-theme'),
  verseCard: document.querySelector('.verse-card'),
  newVerseBtn: document.querySelector('.button')
};

// Configuration
const config = {
  fadeDelay: 500,
  debug: false
};

// Debug logging
function log(message, data) {
  if (config.debug) {
    console.log(`[DEBUG] ${message}`, data || '');
  }
}

/**
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
}

/**
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
}

// Initialize
function init() {
  log('Initializing app');
  
  // Check elements
  Object.entries(elements).forEach(([key, element]) => {
    if (!element) {
      console.error(`Missing element: ${key}`);
    } else {
      log(`Found element: ${key}`);
    }
  });
  
  // Add click handler
  if (elements.newVerseBtn) {
    elements.newVerseBtn.addEventListener('click', () => {
      log('New verse button clicked');
      fetchVerse();
    });
    log('Added click handler');
  }

  // Add keyboard handler for 'n' key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'n' && !elements.newVerseBtn.disabled) {
      log('N key pressed');
      fetchVerse();
    }
  });
  log('Added keyboard handler');

  // Add dark mode listener
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeMediaQuery.addEventListener('change', () => {
    log('Dark mode preference changed');
    const currentTheme = elements.verseTheme?.textContent?.trim().toLowerCase();
    if (currentTheme && !['loading', 'error'].includes(currentTheme)) {
      setThemeText(currentTheme);
    }
  });
  log('Added dark mode listener');
  
  // Fetch initial verse
  fetchVerse();
  log('Initialization complete');
}

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
  log('Waiting for DOMContentLoaded');
} else {
  init();
  log('DOM already loaded, initializing');
} 