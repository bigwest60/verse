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
let state = {
  isLoading: false,
  currentTheme: null,
  retryCount: 0,
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  transitionInProgress: false
};

/**
 * Listen for system dark mode changes
 */
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  state.isDarkMode = e.matches;
  if (state.currentTheme) {
    updateThemeColors(state.currentTheme);
    updateBackground(state.currentTheme);
  }
});

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
 * Update theme colors in the UI
 * @param {string} theme
 */
function updateThemeColors(theme) {
  const colors = getThemeColors(theme);
  if (!colors) return;

  // Apply theme colors with transition
  document.documentElement.style.setProperty('--theme-color', colors.color);
  document.documentElement.style.setProperty('--theme-overlay', colors.overlay);
}

/**
 * Preload background images for smooth transitions
 */
function preloadBackgroundImages() {
  Object.keys(config.themes).forEach(theme => {
    // Preload both light and dark variants
    const lightImg = new Image();
    lightImg.src = `/images/bg-${theme}.jpg`;
    
    const darkImg = new Image();
    darkImg.src = `/images/bg-${theme}-dark.jpg`;
  });
}

/**
 * Set loading state with visual feedback
 * @param {boolean} loading
 */
function setLoadingState(loading) {
  state.isLoading = loading;
  elements.verseCard.classList.toggle('loading', loading);
  elements.newVerseBtn.disabled = loading;
  
  if (loading) {
    elements.verseText.textContent = 'Loading verse...';
    elements.verseRef.textContent = '';
  }
}

/**
 * Update the background based on verse theme
 * @param {string} theme
 */
function updateBackground(theme) {
  if (!theme || state.transitionInProgress) return;

  const colors = getThemeColors(theme);
  if (!colors) return;

  state.transitionInProgress = true;
  document.body.style.backgroundColor = colors.color;
  
  // Determine which image variant to use based on dark mode
  const imageSuffix = state.isDarkMode ? '-dark' : '';
  const imagePath = `/images/bg-${theme}${imageSuffix}.jpg`;
  
  const img = new Image();
  img.onload = () => {
    // Create overlay effect
    document.body.style.backgroundImage = `
      linear-gradient(${colors.overlay}, ${colors.overlay}),
      url(${imagePath})
    `;
    state.currentTheme = theme;
    
    // Reset transition state after animation completes
    setTimeout(() => {
      state.transitionInProgress = false;
    }, config.fadeDelay);
  };
  img.onerror = () => {
    // If dark variant fails, try light variant as fallback
    if (state.isDarkMode) {
      const lightImg = new Image();
      lightImg.onload = () => {
        document.body.style.backgroundImage = `
          linear-gradient(${colors.overlay}, ${colors.overlay}),
          url(/images/bg-${theme}.jpg)
        `;
        state.currentTheme = theme;
        setTimeout(() => {
          state.transitionInProgress = false;
        }, config.fadeDelay);
      };
      lightImg.onerror = () => {
        console.warn(`Failed to load background for theme: ${theme}`);
        document.body.style.backgroundImage = 'none';
        state.transitionInProgress = false;
      };
      lightImg.src = `/images/bg-${theme}.jpg`;
    } else {
      console.warn(`Failed to load background for theme: ${theme}`);
      document.body.style.backgroundImage = 'none';
      state.transitionInProgress = false;
    }
  };
  img.src = imagePath;
}

/**
 * Display error message with retry option
 * @param {Error} error
 */
function handleError(error) {
  console.error('Error:', error);
  elements.verseText.textContent = 'Error loading verse. Please try again.';
  elements.verseRef.textContent = '';
  elements.verseCard.classList.remove('loading');
  elements.newVerseBtn.disabled = false;
  
  if (state.retryCount < config.maxRetries) {
    state.retryCount++;
    setTimeout(fetchVerse, config.retryDelay);
  }
}

/**
 * Update the UI with new verse data
 * @param {Object} verse
 */
function updateVerseDisplay(verse) {
  setTimeout(() => {
    elements.verseText.textContent = verse.text;
    elements.verseRef.textContent = verse.reference;
    elements.verseCard.classList.remove('loading');
    elements.newVerseBtn.disabled = false;
    updateBackground(verse.theme);
  }, config.fadeDelay);
}

/**
 * Fetch and display a new verse
 */
async function fetchVerse() {
  if (state.isLoading) return;
  
  try {
    setLoadingState(true);
    const response = await fetch('/api/verse');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const verse = await response.json();
    state.retryCount = 0;
    updateVerseDisplay(verse);
    
  } catch (error) {
    handleError(error);
  } finally {
    setLoadingState(false);
  }
}

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} e
 */
function handleKeyPress(e) {
  // Only handle shortcuts if not typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  if (e.key === 'n' || e.key === ' ') {
    e.preventDefault();
    fetchVerse();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Set up event listeners
  document.addEventListener('keydown', handleKeyPress);
  elements.newVerseBtn.addEventListener('click', fetchVerse);
  
  // Preload background images
  preloadBackgroundImages();
  
  // Fetch initial verse
  fetchVerse();
}); 