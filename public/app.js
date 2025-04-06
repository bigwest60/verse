// Cache DOM elements
const elements = {
  verseText: document.getElementById('verse-text'),
  verseRef: document.getElementById('verse-reference'),
  verseCard: document.querySelector('.verse-card'),
  newVerseBtn: document.querySelector('.button')
};

// Configuration
const config = {
  fadeDelay: 300,
  maxRetries: 3,
  retryDelay: 1000,
  imageSizes: [480, 768, 1080, 1920],
  themes: {
    love: {
      light: { color: '#ffd6d6', overlay: 'rgba(255, 214, 214, 0.1)' },
      dark: { color: '#4d2626', overlay: 'rgba(77, 38, 38, 0.2)' }
    },
    guidance: {
      light: { color: '#d6e6ff', overlay: 'rgba(214, 230, 255, 0.1)' },
      dark: { color: '#26334d', overlay: 'rgba(38, 51, 77, 0.2)' }
    },
    trust: {
      light: { color: '#d6ffd6', overlay: 'rgba(214, 255, 214, 0.1)' },
      dark: { color: '#264d26', overlay: 'rgba(38, 77, 38, 0.2)' }
    },
    strength: {
      light: { color: '#e6d6ff', overlay: 'rgba(230, 214, 255, 0.1)' },
      dark: { color: '#332647', overlay: 'rgba(51, 38, 71, 0.2)' }
    },
    purpose: {
      light: { color: '#fff3d6', overlay: 'rgba(255, 243, 214, 0.1)' },
      dark: { color: '#4d4526', overlay: 'rgba(77, 69, 38, 0.2)' }
    },
    rest: {
      light: { color: '#d6fff3', overlay: 'rgba(214, 255, 243, 0.1)' },
      dark: { color: '#264d45', overlay: 'rgba(38, 77, 69, 0.2)' }
    },
    hope: {
      light: { color: '#ffe6d6', overlay: 'rgba(255, 230, 214, 0.1)' },
      dark: { color: '#4d3326', overlay: 'rgba(77, 51, 38, 0.2)' }
    },
    future: {
      light: { color: '#f3d6ff', overlay: 'rgba(243, 214, 255, 0.1)' },
      dark: { color: '#45264d', overlay: 'rgba(69, 38, 77, 0.2)' }
    },
    transformation: {
      light: { color: '#d6ffff', overlay: 'rgba(214, 255, 255, 0.1)' },
      dark: { color: '#264d4d', overlay: 'rgba(38, 77, 77, 0.2)' }
    },
    newness: {
      light: { color: '#ffffe6', overlay: 'rgba(255, 255, 230, 0.1)' },
      dark: { color: '#4d4d33', overlay: 'rgba(77, 77, 51, 0.2)' }
    },
    refuge: {
      light: { color: '#f3ffd6', overlay: 'rgba(243, 255, 214, 0.1)' },
      dark: { color: '#454d26', overlay: 'rgba(69, 77, 38, 0.2)' }
    },
    fruit: {
      light: { color: '#ffd6e6', overlay: 'rgba(255, 214, 230, 0.1)' },
      dark: { color: '#4d2633', overlay: 'rgba(77, 38, 51, 0.2)' }
    },
    faith: {
      light: { color: '#e6ffd6', overlay: 'rgba(230, 255, 214, 0.1)' },
      dark: { color: '#334d26', overlay: 'rgba(51, 77, 38, 0.2)' }
    },
    wisdom: {
      light: { color: '#ffd6f3', overlay: 'rgba(255, 214, 243, 0.1)' },
      dark: { color: '#4d2645', overlay: 'rgba(77, 38, 69, 0.2)' }
    },
    care: {
      light: { color: '#d6ffe6', overlay: 'rgba(214, 255, 230, 0.1)' },
      dark: { color: '#264d33', overlay: 'rgba(38, 77, 51, 0.2)' }
    },
    courage: {
      light: { color: '#ffe6e6', overlay: 'rgba(255, 230, 230, 0.1)' },
      dark: { color: '#4d3333', overlay: 'rgba(77, 51, 51, 0.2)' }
    },
    mission: {
      light: { color: '#e6d6e6', overlay: 'rgba(230, 214, 230, 0.1)' },
      dark: { color: '#332633', overlay: 'rgba(51, 38, 51, 0.2)' }
    },
    creation: {
      light: { color: '#d6ffe6', overlay: 'rgba(214, 255, 230, 0.1)' },
      dark: { color: '#264d33', overlay: 'rgba(38, 77, 51, 0.2)' }
    },
    heaven: {
      light: { color: '#e6e6ff', overlay: 'rgba(230, 230, 255, 0.1)' },
      dark: { color: '#33334d', overlay: 'rgba(51, 51, 77, 0.2)' }
    }
  }
};

// State management
const state = {
  currentTheme: null,
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  transitionInProgress: false,
  retryCount: 0,
  loadedImages: new Map()
};

/**
 * Get the appropriate image size based on screen width
 * @returns {number}
 */
function getImageSize() {
  const width = window.innerWidth * window.devicePixelRatio;
  return config.imageSizes.find(size => size >= width) || config.imageSizes[config.imageSizes.length - 1];
}

/**
 * Load an image with fallback support
 * @param {string} theme
 * @param {boolean} isDark
 * @returns {Promise<HTMLImageElement>}
 */
async function loadImage(theme, isDark) {
  const suffix = isDark ? '-dark' : '';
  const path = `/images/bg-${theme}${suffix}.jpg`;
  
  try {
    const img = new Image();
    img.src = path;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    return img;
  } catch (err) {
    console.error(`Failed to load image: ${path}`, err);
    throw err;
  }
}

/**
 * Get theme colors based on current mode
 * @param {string} theme
 * @returns {Object}
 */
function getThemeColors(theme) {
  const themeConfig = config.themes[theme];
  if (!themeConfig) return null;
  return state.isDarkMode ? themeConfig.dark : themeConfig.light;
}

/**
 * Update background based on theme
 * @param {string} theme
 */
async function updateBackground(theme) {
  if (!theme || theme === state.currentTheme) return;
  
  try {
    const colors = getThemeColors(theme);
    if (!colors) {
      console.error('Invalid theme:', theme);
      return;
    }
    
    // Start loading the image
    const img = await loadImage(theme, state.isDarkMode);
    
    // Apply the theme colors first
    document.documentElement.style.setProperty('--theme-color', colors.color);
    document.documentElement.style.setProperty('--theme-overlay', colors.overlay);
    
    // Then update the background image
    document.body.style.backgroundImage = `url(${img.src})`;
    document.body.classList.add('loaded');
    
    state.currentTheme = theme;
  } catch (error) {
    console.error('Failed to update background:', error);
  }
}

/**
 * Fetch and display a new verse
 */
async function fetchVerse() {
  if (elements.verseCard.classList.contains('loading')) return;
  
  elements.verseCard.classList.add('loading');
  elements.newVerseBtn.disabled = true;
  
  try {
    const response = await fetch('/api/verse');
    if (!response.ok) throw new Error('Failed to fetch verse');
    
    const verse = await response.json();
    
    // Start background update first
    const backgroundPromise = updateBackground(verse.theme);
    
    // Fade out current text
    elements.verseText.style.opacity = '0';
    elements.verseRef.style.opacity = '0';
    
    // Wait for background update
    await backgroundPromise;
    
    // Update text
    setTimeout(() => {
      elements.verseText.textContent = verse.text;
      elements.verseRef.textContent = verse.reference;
      elements.verseText.style.opacity = '1';
      elements.verseRef.style.opacity = '1';
    }, config.fadeDelay);
    
  } catch (error) {
    console.error('Error fetching verse:', error);
    elements.verseText.textContent = 'Error loading verse. Please try again.';
    elements.verseRef.textContent = '';
  } finally {
    elements.verseCard.classList.remove('loading');
    elements.newVerseBtn.disabled = false;
  }
}

// Initialize only once
function init() {
  // Add event listeners
  elements.newVerseBtn.addEventListener('click', fetchVerse);
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !elements.newVerseBtn.disabled) {
      event.preventDefault();
      fetchVerse();
    }
  });
  
  // Handle dark mode changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    state.isDarkMode = e.matches;
    if (state.currentTheme) {
      updateBackground(state.currentTheme);
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