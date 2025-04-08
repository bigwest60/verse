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
  const themeElement = verseCard.querySelector('.verse-theme');
  if (!themeElement) return;
  
  themeElement.classList.add('fade-out');
  
  // Only show loading text if theme is explicitly undefined
  const text = theme === undefined ? 'loading' : 
               theme === '' ? 'error' :
               theme.toLowerCase();
               
  themeElement.textContent = text;
  themeElement.classList.remove('fade-out');

  // Set background image based on theme
  if (theme && theme !== '') {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const imagePath = `/images/bg-${theme.toLowerCase()}${isDarkMode ? '-dark' : ''}.jpg`;

    // Don't transition to the same image
    if (currentBackgroundImage === imagePath) return;

    // Prevent multiple simultaneous transitions
    if (isLoadingBackground) return;
    
    isLoadingBackground = true;

    try {
      // Preload the image before starting transition
      await preloadImage(imagePath);
      
      // Get the next background layer
      const nextLayer = document.getElementById(`bg-layer-${activeLayer === 1 ? '2' : '1'}`);
      const currentLayer = document.getElementById(`bg-layer-${activeLayer}`);
      
      if (!nextLayer || !currentLayer) {
        throw new Error('Background layers not found');
      }

      // Set up the next layer with the new image
      nextLayer.style.opacity = '0';
      nextLayer.style.backgroundImage = `url("${imagePath}")`;
      nextLayer.classList.remove('active');
      
      // Force a reflow
      void nextLayer.offsetWidth;
      
      // Start transition
      nextLayer.style.opacity = '1';
      nextLayer.classList.add('active');
      
      // Hide current layer
      currentLayer.classList.remove('active');
      currentLayer.style.opacity = '0';
      
      // Update tracking variables
      currentBackgroundImage = imagePath;
      activeLayer = activeLayer === 1 ? 2 : 1;
      
      // Wait for transition to complete
      await new Promise(resolve => setTimeout(resolve, config.transitionDuration));
      
      // Clean up old layer
      currentLayer.style.backgroundImage = 'none';
      
    } catch (error) {
      // If we have a current background, keep it
      if (currentBackgroundImage) {
        try {
          // Try to restore the previous background if needed
          const currentLayer = document.getElementById(`bg-layer-${activeLayer}`);
          if (currentLayer && !currentLayer.style.backgroundImage.includes(currentBackgroundImage)) {
            await preloadImage(currentBackgroundImage);
            currentLayer.style.backgroundImage = `url("${currentBackgroundImage}")`;
            currentLayer.classList.add('active');
          }
        } catch (e) {
          // Silently fail if restore fails
        }
      }
    } finally {
      isLoadingBackground = false;
    }
  }
}

/**
 * Fetch and display a new verse
 */
async function fetchVerse() {
  if (!verseCard || verseCard.classList.contains('loading')) {
    return;
  }
  
  verseCard.classList.add('loading');
  if (newVerseBtn) {
    newVerseBtn.disabled = true;
  }
  
  // Add fade-out classes
  verseText.classList.add('fade-out');
  verseReference.classList.add('fade-out');
  
  try {
    // Get random verse from local data
    const verse = window.VERSES[Math.floor(Math.random() * window.VERSES.length)];
    
    // Update current verse for sharing
    currentVerse = verse;
    
    // Update theme immediately
    if (verse && typeof verse.theme === 'string') {
      setThemeText(verse.theme);
    } else {
      setThemeText('');
    }
    
    // Update verse text and reference after fade out
    setTimeout(() => {
      if (verseText) {
        verseText.textContent = verse.text || 'Error: No verse text';
        verseText.classList.remove('fade-out');
      }
      
      if (verseReference) {
        verseReference.textContent = verse.reference || '';
        verseReference.classList.remove('fade-out');
      }
      
      // Remove loading state
      verseCard.classList.remove('loading');
      if (newVerseBtn) {
        newVerseBtn.disabled = false;
      }
    }, config.fadeDelay);
    
  } catch (error) {
    setTimeout(() => {
      if (verseText) {
        verseText.textContent = 'Error loading verse. Please try again.';
        verseText.classList.remove('fade-out');
      }
      if (verseReference) {
        verseReference.textContent = '';
        verseReference.classList.remove('fade-out');
      }
      setThemeText('');
      
      // Remove loading state
      verseCard.classList.remove('loading');
      if (newVerseBtn) {
        newVerseBtn.disabled = false;
      }
    }, config.fadeDelay);
  }
}

// Functions
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Remove focus from the theme toggle button
    document.getElementById('themeToggle').blur();
    
    // Update background for current verse theme
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
        alert('Could not copy verse. Please try again.');
    }
    
    document.body.removeChild(textarea);
}

// Initialize
function init() {
  // Initialize DOM elements
  verseCard = document.getElementById('verseCard');
  if (!verseCard) {
    return;
  }
  
  verseText = verseCard.querySelector('.verse-text');
  verseReference = verseCard.querySelector('.verse-reference');
  newVerseBtn = document.getElementById('newVerseBtn');
  shareBtn = document.getElementById('shareBtn');
  themeToggle = document.getElementById('themeToggle');
  
  // Verify all required elements exist
  if (!verseText || !verseReference || !newVerseBtn || !shareBtn || !themeToggle) {
    return;
  }

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

  // Add dark mode listener
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeMediaQuery.addEventListener('change', () => {
    const currentTheme = verseCard.querySelector('.verse-theme')?.textContent?.trim().toLowerCase();
    if (currentTheme && !['loading', 'error'].includes(currentTheme)) {
      setThemeText(currentTheme);
    }
  });
  
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
}

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
} 