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

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
  retryDelay: 1000 // 1 second
};

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
      console.log('verses.json not found, running prepare script...');
      try {
        execSync('npm run prepare', { stdio: 'inherit' });
      } catch (prepareError) {
        console.error('Error running prepare script:', prepareError);
        throw new Error('Failed to prepare verses data');
      }
    }
    
    const data = fs.readFileSync(VERSES_PATH, 'utf8');
    const verses = JSON.parse(data);
    
    // Reset retry count on success
    versesCache = {
      data: verses,
      timestamp: now,
      retryCount: 0,
      maxRetries: versesCache.maxRetries,
      retryDelay: versesCache.retryDelay
    };
    
    return verses;
  } catch (error) {
    console.error('Error loading verses:', error);
    
    // Implement retry logic
    if (versesCache.retryCount < versesCache.maxRetries) {
      versesCache.retryCount++;
      console.log(`Retrying in ${versesCache.retryDelay}ms (attempt ${versesCache.retryCount}/${versesCache.maxRetries})...`);
      
      await new Promise(resolve => setTimeout(resolve, versesCache.retryDelay));
      return loadVerses(); // Recursive retry
    }
    
    throw new Error('Failed to load verses data after retries');
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
    const randomIndex = Math.floor(Math.random() * verses.verses.length);
    const verse = verses.verses[randomIndex];
    
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
  res.json({ status: 'ok' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
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