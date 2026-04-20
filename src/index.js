import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const DEBUG = process.env.DEBUG || !IS_PROD;
const HTML_PATH = path.join(__dirname, '../public/index.html');
const HELP_HTML_PATH = path.join(__dirname, '../public/help.html');
const ESBUILD_META_PATH = path.join(__dirname, '../esbuild-meta.json');
const CSS_MANIFEST_PATH = path.join(__dirname, '../scripts/.css-manifest.txt');

// Debug info
if (DEBUG) {
  console.log('---- Server Debug Info ----');
  console.log(`Current directory: ${__dirname}`);
  console.log(`Environment: ${IS_PROD ? 'production' : 'development'}`);
  console.log(`Node version: ${process.version}`);
  console.log('--------------------------');
}

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: IS_PROD ? 'https://dailyverse.online' : 'http://localhost:3000',
  methods: ['GET']
}));

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
    // Skip caching for HTML files AND the root path
    if (req.path.endsWith('.html') || req.path === '/') {
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
} else {
  // Development mode: Prevent caching
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
  });
}

// Serve static files
app.use(express.static('public', {
  index: false,
  extensions: ['html', 'htm'],
  dotfiles: 'deny',
  setHeaders: (res, path) => {
    // Set content type for WebP images
    if (path.endsWith('.webp')) {
      res.set('Content-Type', 'image/webp');
    }
  }
}));

// Helper to read manifest files - caching result in production
let assetPaths = null;
function getAssetPaths() {
  if (assetPaths && IS_PROD) {
    return assetPaths;
  }
  
  let jsFilename = '/app.js'; // Default for dev
  let cssFilename = '/styles.css'; // Default for dev

  if (IS_PROD) {
    try {
      // Read JS filename from esbuild meta
      if (fs.existsSync(ESBUILD_META_PATH)) {
        const meta = JSON.parse(fs.readFileSync(ESBUILD_META_PATH, 'utf8'));
        // Find the output file corresponding to the entry point
        const outputKey = Object.keys(meta.outputs).find(key => meta.outputs[key].entryPoint === 'public/app.js');
        if (outputKey) {
          jsFilename = `/${path.basename(outputKey)}`;
        }
      }
    } catch (e) { console.error('Error reading JS metafile:', e); }

    try {
      // Read CSS filename from manifest
      if (fs.existsSync(CSS_MANIFEST_PATH)) {
        cssFilename = `/${fs.readFileSync(CSS_MANIFEST_PATH, 'utf8').trim()}`;
      }
    } catch (e) { console.error('Error reading CSS manifest:', e); }
  }
  
  assetPaths = { js: jsFilename, css: cssFilename };
  return assetPaths;
}

// Routes
app.get('/', (req, res) => {
  if (IS_PROD) {
    try {
      const htmlTemplate = fs.readFileSync(HTML_PATH, 'utf8');
      const assets = getAssetPaths();
      const injectedHtml = htmlTemplate
        .replace(/<!-- CSS_FILENAME --><link[^>]+>/, `<link rel="stylesheet" href="${assets.css}">`)
        .replace(/<!-- JS_FILENAME --><script[^>]+><\/script>/, `<script src="${assets.js}"><\/script>`);
      
      // Set appropriate headers for HTML in prod (no-cache already handled by middleware)
      res.set('Content-Type', 'text/html');
      res.send(injectedHtml);
    } catch (e) {
      console.error('Error serving modified index.html:', e);
      res.status(500).send('Server error serving HTML');
    }
  } else {
    // Development: serve the original index.html
    res.sendFile(HTML_PATH);
  }
});

app.get('/help.html', (req, res) => {
  if (IS_PROD) {
    try {
      const htmlTemplate = fs.readFileSync(HELP_HTML_PATH, 'utf8');
      const assets = getAssetPaths();
      const injectedHtml = htmlTemplate
        .replace('<link rel="stylesheet" href="styles.css">', `<link rel="stylesheet" href="${assets.css}">`);
      
      res.set('Content-Type', 'text/html');
      res.send(injectedHtml);
    } catch (e) {
      console.error('Error serving modified help.html:', e);
      res.status(500).send('Server error serving HTML');
    }
  } else {
    res.sendFile(HELP_HTML_PATH);
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(IS_PROD ? {} : { message: err.message })
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
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
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