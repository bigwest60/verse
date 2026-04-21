// Configuration
const config = {
  fadeDelay: 300,
  debug: false,
  transitionDuration: 500
};

// Keep track of current background state
let isLoadingBackground = false;
let pendingThemeChange = null;
let currentBackgroundImage = '';
let activeLayer = 1;

// Cache for preloaded images
const imageCache = new Map();

// State
let currentVerse = null;
let isLoading = false;
let versesCache = null;

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

// Define available image sizes (must match optimize-images.js)
const IMAGE_SIZES = [480, 768, 1080, 1920];

/**
 * Check browser support for WebP format.
 * @returns {Promise<boolean>} Promise resolving to true if WebP is supported, false otherwise.
 */
const supportsWebP = (() => {
  let memoizedResult = null;
  return async () => {
    if (memoizedResult !== null) {
      return memoizedResult;
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        memoizedResult = (img.width > 0 && img.height > 0);
        resolve(memoizedResult);
      };
      img.onerror = () => {
        memoizedResult = false;
        resolve(memoizedResult);
      };
      // A small, representative WebP image data URL
      img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    });
  };
})();

/**
 * Get the best image size suffix based on screen width.
 * @returns {number} The optimal image width suffix (e.g., 480, 768, 1080, 1920).
 */
function getOptimalImageSize() {
  const screenWidth = window.innerWidth;
  // Find the smallest size that's >= screen width, or use the largest size
  return IMAGE_SIZES.find(size => size >= screenWidth) || IMAGE_SIZES[IMAGE_SIZES.length - 1];
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
    const themeSlug = theme.toLowerCase();
    const optimalSize = getOptimalImageSize();
    const useWebP = await supportsWebP();
    const extension = useWebP ? 'webp' : 'jpg';
    const imagePath = `images/bg-${themeSlug}${isDarkMode ? '-dark' : ''}-${optimalSize}.${extension}`;

    // Don't transition to the same image
    if (currentBackgroundImage === imagePath) return;

    // Queue theme changes during active transition instead of dropping them
    if (isLoadingBackground) {
      pendingThemeChange = theme;
      return;
    }
    
    isLoadingBackground = true;

    try {
      // Preload the CHOSEN sized image before starting transition
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
      
      // If we have a current background, keep it (ensure it uses the correct path format too)
      if (currentBackgroundImage) {
        try {
          if (currentLayer && !currentLayer.style.backgroundImage.includes(currentBackgroundImage)) {
            await preloadImage(currentBackgroundImage);
            currentLayer.style.backgroundImage = `url("${currentBackgroundImage}")`;
            currentLayer.classList.add('active');
          }
        } catch (e) {
          // Silently fail if restore fails
        }
      }
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
      // Process queued theme change if one was requested during transition
      if (pendingThemeChange) {
        const queued = pendingThemeChange;
        pendingThemeChange = null;
        setThemeText(queued);
      }
    }
  }
}

/**
 * Fetch and display a new verse
 */
async function fetchVerse() {
  if (!verseCard || isLoading) {
    return;
  }
  
  isLoading = true;
  verseCard.classList.add('loading');
  if (newVerseBtn) {
    newVerseBtn.disabled = true;
    newVerseBtn.classList.add('loading');
  }
  
  // Add fade-out classes
  verseText.classList.add('fade-out');
  verseReference.classList.add('fade-out');
  
  try {
    // Fetch verses from JSON file (cached after first load)
    if (!versesCache) {
      const response = await fetch('verses.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      versesCache = await response.json();
    }
    const data = versesCache;
    
    // Check if the nested 'verses' property is a non-empty array
    if (!data || !Array.isArray(data.verses) || data.verses.length === 0) {
       throw new Error('Invalid or empty verses data received in verses.json');
    }
    
    const versesArray = data.verses; // Get the actual array
    
    // Get random verse from the verses array
    const verse = versesArray[Math.floor(Math.random() * versesArray.length)];
    
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
      
      if (newVerseBtn) {
        newVerseBtn.disabled = false;
        newVerseBtn.classList.remove('loading');
      }
    }, config.fadeDelay);
    
    // Remove loading class after fade-in and animations
    setTimeout(() => {
      if (verseCard) {
        verseCard.classList.remove('loading');
      }
    }, config.fadeDelay + config.transitionDuration);
    
  } catch (error) {
    console.error('Error fetching verse:', error);
    if (verseText) verseText.textContent = 'Error fetching verse.';
    if (verseReference) verseReference.textContent = '';
    setThemeText('');
  } finally {
    isLoading = false;
    if (verseCard && verseCard.classList.contains('loading')) {
      verseCard.classList.remove('loading');
    }
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

async function fallbackShare(text) {
  // Try modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Verse copied to clipboard!', 'success');
      return;
    } catch {
      // Fall through to execCommand
    }
  }
  
  // Legacy fallback
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    showToast('Verse copied to clipboard!', 'success');
  } catch {
    showToast('Could not copy verse.', 'error');
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
        window.location.href = 'help.html';
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
  
  // Fetch initial verse
  fetchVerse();
}

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/**
 * Displays a toast notification.
 * @param {string} message The message to display.
 * @param {string} type Optional type ('success', 'error', etc.) for styling.
 * @param {number} duration How long the toast stays visible (in ms).
 */
function showToast(message, type = '', duration = 3000) {
  let container = document.getElementById('toast-container');
  
  // Create container if it doesn't exist
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type) {
    toast.classList.add(type);
  }
  toast.textContent = message;
  
  // Add to container
  container.appendChild(toast);
  
  // Trigger reflow to enable animation
  void toast.offsetWidth;
  
  // Add 'show' class to animate in
  toast.classList.add('show');
  
  // Set timeout to remove the toast
  setTimeout(() => {
    toast.classList.remove('show');
    // Remove element after transition finishes
    toast.addEventListener('transitionend', () => {
      if (toast.parentNode === container) { // Check if it hasn't been removed already
        container.removeChild(toast);
        // Optional: Remove container if it's empty
        if (container.children.length === 0) {
           document.body.removeChild(container);
        }
      }
    });
  }, duration);
} 
