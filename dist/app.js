// Initialize app
(function() {
  // Global state initialization
  window.isLoadingBackground = false;
  window.currentBackgroundImage = '';
  window.activeLayer = 1;
  window.imageCache = new Map();
  window.currentVerse = null;
  window.isLoading = false;
  window.prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  window.theme = localStorage.getItem('theme') || (window.prefersDark.matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', window.theme);

  // Helper Functions
  window.preloadImage = function(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // DOM Elements
  const elements = {
    verseCard: null,
    verseText: null,
    verseRef: null,
    verseTheme: null,
    newVerseBtn: null,
    shareBtn: null,
    themeToggle: null
  };

  // Debug logging
  function log(message, data) {
    if (config.debug) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  // Initialize the app
  function init() {
    // Configuration
const config = {
  fadeDelay: 300,
  debug: false,
  transitionDuration: 500
};

// Keep track of current background state
let isLoadingBackground = false;
let currentBackgroundImage = '';
let activeLayer = 1;

// Cache for preloaded images
const imageCache = new Map();

// State
let currentVerse = null;
let isLoading = false;

// DOM Elements
let verseCard;
let verseText;
let verseReference;
let newVerseBtn;
let shareBtn;
let themeToggle;

// Theme handling
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const theme = localStorage.getItem('theme') || (prefersDark.matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);

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
      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
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

    // Prevent multiple simultaneous transitions
    if (isLoadingBackground) {
      log('Already loading background, skipping');
      return;
    }
    
    isLoadingBackground = true;

    try {
      // Preload the image before starting transition
      await preloadImage(imagePath);
      
      // Get the next background layer
      const nextLayer = document.getElementById(activeLayer === 1 ? 'bg-layer-2' : 'bg-layer-1');
      const currentLayer = document.getElementById(activeLayer === 1 ? 'bg-layer-1' : 'bg-layer-2');
      
      if (!nextLayer || !currentLayer) {
        throw new Error('Background layers not found');
      }
      
      // Set the new image on the inactive layer
      nextLayer.style.backgroundImage = `url('${imagePath}')`;
      
      // Force a reflow to ensure the browser processes the background change
      void nextLayer.offsetWidth;
      
      // Start the transition by making the next layer visible
      nextLayer.classList.add('active');
      currentLayer.classList.remove('active');
      
      // Wait for transition to complete
      await new Promise(resolve => setTimeout(resolve, config.transitionDuration));
      
      // Update tracking variables
      currentBackgroundImage = imagePath;
      activeLayer = activeLayer === 1 ? 2 : 1;
      
      log('Background updated:', imagePath);
      
    } catch (error) {
      log('Image load failed:', error);
      
      // If we have a current background, keep it
      if (currentBackgroundImage) {
        try {
          // Try to restore the previous background if needed
          const currentLayer = document.getElementById(activeLayer === 1 ? 'bg-layer-1' : 'bg-layer-2');
          if (currentLayer && !currentLayer.style.backgroundImage.includes(currentBackgroundImage)) {
            await preloadImage(currentBackgroundImage);
            currentLayer.style.backgroundImage = `url('${currentBackgroundImage}')`;
            currentLayer.classList.add('active');
          }
          log('Kept current background:', currentBackgroundImage);
        } catch (restoreError) {
          // If restoring fails, use fallback gradient
          const gradientColors = isDarkMode ? 
            ['#1a202c', '#2d3748'] : // Dark mode gradient
            ['#f7fafc', '#edf2f7']; // Light mode gradient
            
          const gradient = `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`;
          const currentLayer = document.getElementById(activeLayer === 1 ? 'bg-layer-1' : 'bg-layer-2');
          if (currentLayer) {
            currentLayer.style.backgroundImage = gradient;
            currentLayer.classList.add('active');
          }
          currentBackgroundImage = '';
          log('Using fallback gradient after restore failed');
        }
      } else {
        // If no current background, use fallback gradient
        const gradientColors = isDarkMode ? 
          ['#1a202c', '#2d3748'] : // Dark mode gradient
          ['#f7fafc', '#edf2f7']; // Light mode gradient
          
        const gradient = `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`;
        const currentLayer = document.getElementById(activeLayer === 1 ? 'bg-layer-1' : 'bg-layer-2');
        if (currentLayer) {
          currentLayer.style.backgroundImage = gradient;
          currentLayer.classList.add('active');
        }
        currentBackgroundImage = '';
        log('Using fallback gradient (no previous background)');
      }
    } finally {
      isLoadingBackground = false;
    }
  } else {
    // Clear background image if no theme
    const currentLayer = document.getElementById(activeLayer === 1 ? 'bg-layer-1' : 'bg-layer-2');
    const otherLayer = document.getElementById(activeLayer === 1 ? 'bg-layer-2' : 'bg-layer-1');
    
    if (currentLayer) {
      currentLayer.style.backgroundImage = 'none';
      currentLayer.classList.add('active');
    }
    if (otherLayer) {
      otherLayer.classList.remove('active');
    }
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
    // Get random verse from local data
    const verse = window.VERSES[Math.floor(Math.random() * window.VERSES.length)];
    log('Selected verse:', verse);
    
    // Update current verse for sharing
    currentVerse = verse;
    
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
  
  // Add fade-out classes
  verseText.classList.add('fade-out');
  verseReference.classList.add('fade-out');
  
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

      // Re-enable button as soon as we have valid data
      if (newVerseBtn) {
        newVerseBtn.disabled = false;
      }
      verseCard.classList.remove('loading');
    } catch (parseError) {
      console.error('Failed to parse verse JSON:', parseError);
      throw parseError;
    }
    
    // Start both transitions in parallel
    const themePromise = (async () => {
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
    })();
    
    // Start updating verse text immediately
    const textPromise = new Promise(resolve => {
      // Small initial delay to let fade-out start
      setTimeout(() => {
        if (verseText) {
          verseText.textContent = verse.text || 'Error: No verse text';
          verseText.classList.remove('fade-out');
          log('Updated verse text to:', verseText.textContent);
        }
        
        if (verseReference) {
          verseReference.textContent = verse.reference || '';
          verseReference.classList.remove('fade-out');
          log('Updated verse reference to:', verseReference.textContent);
        }
        resolve();
      }, 100); // Minimal delay for smooth transition
    });
    
    // Wait for transitions to complete in the background
    Promise.all([themePromise, textPromise]).catch(error => {
      console.error('Error during transitions:', error);
    });
    
    // Update current verse
    currentVerse = verse;
    
  } catch (error) {
    console.error('Error in fetchVerse:', error);
    log('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Show error state immediately
    if (verseText) {
      verseText.textContent = 'Error loading verse. Please try again.';
      verseText.classList.remove('fade-out');
    }
    if (verseReference) {
      verseReference.textContent = '';
      verseReference.classList.remove('fade-out');
    }
    setThemeText('').catch(console.error);
    
    // Remove loading state and re-enable button
    verseCard.classList.remove('loading');
    if (newVerseBtn) {
      newVerseBtn.disabled = false;
    }
  } finally {
    isLoading = false;
  }
  
  log('Finished fetchVerse');
}

// Functions
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Remove focus from the theme toggle button
    elements.themeToggle.blur();
    
    // Update background image for current theme
    if (currentVerse && currentVerse.theme) {
      setThemeText(currentVerse.theme);
    }
}

async function shareVerse() {
    if (!currentVerse) return;
    
    const shareText = `${currentVerse.text}\n\n— ${currentVerse.reference}`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Daily Verse',
                text: shareText
            });
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
                fallbackShare(shareText);
            }
        }
    } else {
        fallbackShare(shareText);
    }
}

function fallbackShare(text) {
    // Create a temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        alert('Verse copied to clipboard!');
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        alert('Could not copy verse. Please try again.');
    }
    
    document.body.removeChild(textarea);
}

function fallbackShare(text) {
    // Create a temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        alert('Verse copied to clipboard!');
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        alert('Could not copy verse. Please try again.');
    }
    
    document.body.removeChild(textarea);
}

// Initialize
function init() {
  log('Initializing app');
  
  // Initialize DOM elements
  verseCard = document.getElementById('verseCard');
  if (!verseCard) {
    console.error('Missing verseCard');
    return;
  }
  
  verseText = verseCard.querySelector('.verse-text');
  verseReference = verseCard.querySelector('.verse-reference');
  newVerseBtn = document.getElementById('newVerseBtn');
  shareBtn = document.getElementById('shareBtn');
  themeToggle = document.getElementById('themeToggle');
  
  // Verify all required elements exist
  if (!verseText || !verseReference || !newVerseBtn || !shareBtn || !themeToggle) {
    console.error('Missing required DOM elements');
    return;
  }
  
  log('Found all required DOM elements');

  // Add event listeners
  newVerseBtn.addEventListener('click', fetchVerse);
  shareBtn.addEventListener('click', shareVerse);
  themeToggle.addEventListener('click', toggleTheme);

  // Add keyboard shortcuts
  document.addEventListener('keydown', function(event) {
    // Ignore key events when typing in input fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (event.key) {
      case ' ':
        event.preventDefault();
        if (!isLoading) {
          newVerseBtn.click();
        }
        break;
      case 't':
      case 'T':
        event.preventDefault();
        themeToggle.click();
        break;
      case 's':
      case 'S':
        event.preventDefault();
        shareBtn.click();
        break;
      case '?':
      case 'h':
      case 'H':
        event.preventDefault();
        window.location.href = '/help.html';
        break;
    }
  });
  log('Added keyboard shortcuts');

  // Add dark mode listener
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeMediaQuery.addEventListener('change', () => {
    log('Dark mode preference changed');
    const currentTheme = verseCard.querySelector('.verse-theme')?.textContent?.trim().toLowerCase();
    if (currentTheme && !['loading', 'error'].includes(currentTheme)) {
      setThemeText(currentTheme);
    }
  });
  log('Added dark mode listener');
  
  // Add tabindex to theme toggle to prevent focus
  themeToggle.setAttribute('tabindex', '-1');
  
  // Handle spacebar press
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault();
      document.getElementById('newVerseBtn').click();
    }
  });
  
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
  }

  // Start the app
  init();
})();