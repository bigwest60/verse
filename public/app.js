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
  debug: false,
  transitionDuration: 500
};

// Keep track of current background loading state
let isLoadingBackground = false;
let currentBackgroundImage = '';

// Cache for preloaded images
const imageCache = new Map();

// Debug logging
function log(message, data) {
  if (config.debug) {
    console.log(`[DEBUG] ${message}`, data || '');
  }
}

/**
 * Preload an image and cache it
 * @param {string} src Image source URL
 * @returns {Promise} Promise that resolves when image is loaded
 */
function preloadImage(src) {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src));
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Update theme text and background
 * @param {string} theme
 */
async function setThemeText(theme) {
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
    const imagePath = `/images/bg-${theme.toLowerCase()}${isDarkMode ? '-dark' : ''}.jpg`;
    
    // Don't transition to the same image
    if (currentBackgroundImage === imagePath) {
      log('Same background image, skipping transition');
      return;
    }

    // Prevent multiple simultaneous transitions
    if (isLoadingBackground) {
      log('Already loading background, skipping');
      return;
    }
    
    isLoadingBackground = true;

    try {
      // Preload the image before starting transition
      await preloadImage(imagePath);
      
      // Update the background image
      document.body.style.setProperty('background-image', `url('${imagePath}')`);
      document.body.style.setProperty('background-size', 'cover');
      document.body.style.setProperty('background-position', 'center');
      document.body.style.setProperty('background-repeat', 'no-repeat');
      
      currentBackgroundImage = imagePath;
      log('Background updated:', imagePath);
      
    } catch (error) {
      log('Image load failed:', error);
      
      // If we have a current background, keep it
      if (currentBackgroundImage && currentBackgroundImage !== imagePath) {
        try {
          // Try to restore the previous background
          await preloadImage(currentBackgroundImage);
          document.body.style.setProperty('background-image', `url('${currentBackgroundImage}')`);
          log('Restored previous background:', currentBackgroundImage);
        } catch (restoreError) {
          // If restoring fails, use fallback gradient
          const gradientColors = isDarkMode ? 
            ['#1a202c', '#2d3748'] : // Dark mode gradient
            ['#f7fafc', '#edf2f7']; // Light mode gradient
            
          const gradient = `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`;
          document.body.style.setProperty('background-image', gradient);
          currentBackgroundImage = '';
          log('Using fallback gradient after restore failed');
        }
      } else {
        // If no current background or same failed image, use fallback gradient
        const gradientColors = isDarkMode ? 
          ['#1a202c', '#2d3748'] : // Dark mode gradient
          ['#f7fafc', '#edf2f7']; // Light mode gradient
          
        const gradient = `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`;
        document.body.style.setProperty('background-image', gradient);
        currentBackgroundImage = '';
        log('Using fallback gradient (no previous background)');
      }
    } finally {
      isLoadingBackground = false;
    }
  } else {
    // Clear background image if no theme
    document.body.style.setProperty('background-image', 'none');
    currentBackgroundImage = '';
    isLoadingBackground = false;
    log('Background image cleared');
  }
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
    log('Fetching verse from API');
    const response = await fetch('/api/verse');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch verse: ${response.status} ${response.statusText}`);
    }
    
    const responseText = await response.text();
    log('Raw API response:', responseText);
    
    let verse;
    try {
      verse = JSON.parse(responseText);
      log('Parsed verse data:', { 
        hasVerse: !!verse,
        theme: verse?.theme,
        themeType: typeof verse?.theme,
        text: verse?.text,
        reference: verse?.reference
      });
    } catch (parseError) {
      console.error('Failed to parse verse JSON:', parseError);
      throw parseError;
    }
    
    // Update theme immediately
    if (verse && typeof verse.theme === 'string') {
      log('Found valid theme:', verse.theme);
      await setThemeText(verse.theme);
    } else {
      log('Invalid theme:', { 
        verse: verse,
        themeExists: 'theme' in verse,
        themeValue: verse?.theme,
        themeType: typeof verse?.theme
      });
      await setThemeText('');
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
      setThemeText('').catch(console.error);
      
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