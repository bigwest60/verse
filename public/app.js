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
  fadeDelay: 300,
  debug: true
};

// Debug logging
function log(message, data) {
  if (config.debug) {
    console.log(`[DEBUG] ${message}`, data || '');
  }
}

/**
 * Update theme text
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
  
  // Only show loading text if theme is explicitly undefined
  const text = theme === undefined ? 'loading' : 
               theme === '' ? 'error' :
               theme.toLowerCase();
               
  elements.verseTheme.textContent = text;
  log('Theme text set to:', {
    text: text,
    elementContent: elements.verseTheme.textContent,
    elementVisible: elements.verseTheme.offsetParent !== null
  });

  // Set background image based on theme
  if (theme && theme !== '') {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const imagePath = `/images/bg-${theme.toLowerCase()}${isDarkMode ? '-dark' : ''}.jpg`;
    document.body.style.backgroundImage = `url('${imagePath}')`;
    log('Background image:', {
      path: imagePath,
      isDarkMode: isDarkMode,
      theme: theme.toLowerCase(),
      currentStyle: document.body.style.backgroundImage
    });
  } else {
    // Clear background image if no theme
    document.body.style.backgroundImage = '';
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
      setThemeText(verse.theme);
    } else {
      log('Invalid theme:', { 
        verse: verse,
        themeExists: 'theme' in verse,
        themeValue: verse?.theme,
        themeType: typeof verse?.theme
      });
      setThemeText('');
    }
    
    // Update verse text
    if (elements.verseText) {
      elements.verseText.style.opacity = '0';
      setTimeout(() => {
        elements.verseText.textContent = verse.text || 'Error: No verse text';
        elements.verseText.style.opacity = '1';
        log('Updated verse text to:', elements.verseText.textContent);
      }, config.fadeDelay);
    }
    
    // Update reference
    if (elements.verseRef) {
      elements.verseRef.style.opacity = '0';
      setTimeout(() => {
        elements.verseRef.textContent = verse.reference || '';
        elements.verseRef.style.opacity = '1';
        log('Updated verse reference to:', elements.verseRef.textContent);
      }, config.fadeDelay);
    }
    
  } catch (error) {
    console.error('Error in fetchVerse:', error);
    log('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (elements.verseText) {
      elements.verseText.textContent = 'Error loading verse. Please try again.';
    }
    if (elements.verseRef) {
      elements.verseRef.textContent = '';
    }
    setThemeText('');
  } finally {
    if (elements.verseCard) {
      elements.verseCard.classList.remove('loading');
    }
    if (elements.newVerseBtn) {
      elements.newVerseBtn.disabled = false;
    }
    log('Finished fetchVerse');
  }
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