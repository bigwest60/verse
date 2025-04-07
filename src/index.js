import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const VERSES_PATH = path.join(__dirname, '../public/verses.json');
const DEBUG = process.env.DEBUG || !IS_PROD;

// Debug info
if (DEBUG) {
  console.log('---- Server Debug Info ----');
  console.log(`Current directory: ${__dirname}`);
  console.log(`Verses path: ${VERSES_PATH}`);
  console.log(`Environment: ${IS_PROD ? 'production' : 'development'}`);
  console.log(`Node version: ${process.version}`);
  console.log('--------------------------');
}

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add request logging in debug mode
if (DEBUG) {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// Cache control middleware for production
if (IS_PROD) {
  app.use((req, res, next) => {
    // Skip caching for HTML files
    if (req.path.endsWith('.html')) {
      res.set('Cache-Control', 'no-cache');
      return next();
    }
    
    // Cache static assets
    const maxAge = (() => {
      if (req.path.match(/\.(jpg|jpeg|png|webp|gif)$/)) return '1y';
      if (req.path.match(/\.(css|js)$/)) return '1w';
      if (req.path.match(/\.(ico|svg)$/)) return '1d';
      return '1h';
    })();
    
    res.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=60`);
    next();
  });
}

// Serve static files
app.use(express.static('public', {
  index: false,
  extensions: ['html', 'htm'],
  setHeaders: (res, path) => {
    // Set content type for WebP images
    if (path.endsWith('.webp')) {
      res.set('Content-Type', 'image/webp');
    }
  }
}));

// Cache for verses data
let versesCache = {
  data: null,
  timestamp: 0,
  retryCount: 0,
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  lastVerse: null,  // Track the last verse served
  shuffledVerses: [], // Store shuffled verses
  currentIndex: 0    // Track current position in shuffled array
};

/**
 * Implements Fisher-Yates shuffle algorithm
 * @param {Array} array The array to shuffle
 * @returns {Array} A new shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get the next verse from the shuffled array
 * @param {Object} verses The verses data object
 * @returns {Object} A verse object
 */
function getNextVerse(verses) {
  // If we've used all verses or haven't initialized, shuffle them
  if (versesCache.currentIndex >= versesCache.shuffledVerses.length || !versesCache.shuffledVerses.length) {
    versesCache.shuffledVerses = shuffleArray(verses.verses);
    versesCache.currentIndex = 0;
  }

  // Get next verse
  let verse = versesCache.shuffledVerses[versesCache.currentIndex];
  
  // If it's the same as the last verse and we have more verses available,
  // skip to the next one to prevent consecutive repeats
  if (versesCache.lastVerse && 
      verse.reference === versesCache.lastVerse.reference && 
      versesCache.currentIndex + 1 < versesCache.shuffledVerses.length) {
    versesCache.currentIndex++;
    verse = versesCache.shuffledVerses[versesCache.currentIndex];
  }
  
  // Update tracking variables
  versesCache.lastVerse = verse;
  versesCache.currentIndex++;
  
  return verse;
}

/**
 * Load verses data with caching and retry mechanism
 * @returns {Promise<Object>}
 */
async function loadVerses() {
  const now = Date.now();
  
  // Return cached data if valid
  if (versesCache.data && (now - versesCache.timestamp) < CACHE_DURATION) {
    return versesCache.data;
  }
  
  try {
    // Check if verses.json exists
    if (!fs.existsSync(VERSES_PATH)) {
      throw new Error('verses.json not found. Please ensure the file exists in the public directory.');
    }
    
    if (DEBUG) console.log(`Reading verses from ${VERSES_PATH}`);
    const data = fs.readFileSync(VERSES_PATH, 'utf8');
    if (DEBUG) console.log(`Verses file size: ${data.length} bytes`);
    
    try {
      const verses = JSON.parse(data);
      if (DEBUG) console.log(`Parsed ${verses.verses?.length || 0} verses successfully`);
      
      // Reset retry count on success
      versesCache = {
        data: verses,
        timestamp: now,
        retryCount: 0,
        maxRetries: versesCache.maxRetries,
        retryDelay: versesCache.retryDelay,
        lastVerse: null,
        shuffledVerses: [],
        currentIndex: 0
      };
      
      return verses;
    } catch (parseError) {
      console.error('Error parsing verses JSON:', parseError);
      console.error('First 100 characters of data:', data.substring(0, 100));
      throw new Error('Failed to parse verses JSON');
    }
  } catch (error) {
    console.error('Error loading verses:', error);
    
    // Implement retry logic
    if (versesCache.retryCount < versesCache.maxRetries) {
      versesCache.retryCount++;
      console.log(`Retrying in ${versesCache.retryDelay}ms (attempt ${versesCache.retryCount}/${versesCache.maxRetries})...`);
      
      await new Promise(resolve => setTimeout(resolve, versesCache.retryDelay));
      return loadVerses(); // Recursive retry
    }
    
    throw error;
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API routes
app.get('/api/verse', async (req, res) => {
  try {
    const verses = await loadVerses();
    const verse = getNextVerse(verses);
    
    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    });
    
    res.json(verse);
  } catch (error) {
    console.error('Error fetching random verse:', error);
    res.status(500).json({ 
      error: 'Failed to fetch verse',
      details: error.message
    });
  }
});

app.get('/api/verse/meta', async (req, res) => {
  try {
    const verses = await loadVerses();
    const meta = {
      count: verses.verses.length,
      themes: [...new Set(verses.verses.map(v => v.theme))].sort()
    };
    
    res.set({
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/json'
    });
    
    res.json(meta);
  } catch (error) {
    console.error('Error fetching verse metadata:', error);
    res.status(500).json({ 
      error: 'Failed to fetch verse metadata',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Handle PWA-related requests
app.get('/manifest.json', (req, res) => {
  res.json({
    name: 'Daily Verse',
    short_name: 'Verse',
    display: 'browser',
    start_url: '/',
    scope: '/',
    background_color: '#000000',
    theme_color: '#000000',
    icons: []
  });
});

app.get('/icon-192.png', (req, res) => {
  res.sendStatus(204);
});

app.get('/favicon.ico', (req, res) => {
  res.sendStatus(204);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource was not found'
  });
});

// Handle process errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Don't exit the process, just log the error
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  // Don't exit the process, just log the error
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${IS_PROD ? 'production' : 'development'} mode on port ${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  // Don't exit the process, just log the error
});

// Keep the process alive and handle signals gracefully
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT signal. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

// Keep the process running
process.stdin.resume(); 