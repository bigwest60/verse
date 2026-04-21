import express from 'express';
import path from 'path';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

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

// Generate nonce for inline scripts
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomUUID();
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: IS_PROD ? [] : null,
    }
  }
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

// Helper to read manifest files - caching result in production
let assetPaths = null;
function getAssetPaths() {
  if (assetPaths && IS_PROD) {
    return assetPaths;
  }
  
  let jsFilename = 'app.js'; // Default for dev
  let cssFilename = 'styles.css'; // Default for dev

  if (IS_PROD) {
    try {
      // Read JS filename from esbuild meta
      if (fs.existsSync(ESBUILD_META_PATH)) {
        const meta = JSON.parse(fs.readFileSync(ESBUILD_META_PATH, 'utf8'));
        const outputKey = Object.keys(meta.outputs).find(key => meta.outputs[key].entryPoint === 'public/app.js');
        if (outputKey) {
          jsFilename = path.basename(outputKey);
        }
      }
    } catch (e) { console.error('Error reading JS metafile:', e); }

    try {
      // Read CSS filename from manifest
      if (fs.existsSync(CSS_MANIFEST_PATH)) {
        cssFilename = fs.readFileSync(CSS_MANIFEST_PATH, 'utf8').trim();
      }
    } catch (e) { console.error('Error reading CSS manifest:', e); }
  }
  
  assetPaths = { js: jsFilename, css: cssFilename };
  return assetPaths;
}

// Cache HTML templates in production
let indexHtmlCache = null;
let helpHtmlCache = null;

function getIndexHtml() {
  if (indexHtmlCache && IS_PROD) return indexHtmlCache;
  indexHtmlCache = fs.readFileSync(HTML_PATH, 'utf8');
  return indexHtmlCache;
}
function getHelpHtml() {
  if (helpHtmlCache && IS_PROD) return helpHtmlCache;
  helpHtmlCache = fs.readFileSync(HELP_HTML_PATH, 'utf8');
  return helpHtmlCache;
}

// Inject nonce into inline scripts
function injectNonce(html, nonce) {
  return html
    .replace(/<script>/g, `<script nonce="${nonce}">`)
    .replace(/<script type="application\/ld\+json">/g, `<script type="application/ld+json" nonce="${nonce}">`);
}

// HTML routes (before static middleware so they take precedence)
app.get('/', (req, res) => {
  const nonce = res.locals.nonce;
  if (IS_PROD) {
    try {
      const htmlTemplate = getIndexHtml();
      const assets = getAssetPaths();
      const injectedHtml = injectNonce(htmlTemplate, nonce)
        .replace(/<!-- CSS_FILENAME --><link[^>]+>/, `<link rel="stylesheet" href="${assets.css}">`)
        .replace(/<!-- JS_FILENAME --><script[^>]+><\/script>/, `<script src="${assets.js}"><\/script>`);
      
      res.set('Content-Type', 'text/html');
      res.send(injectedHtml);
    } catch (e) {
      console.error('Error serving modified index.html:', e);
      res.status(500).send('Server error serving HTML');
    }
  } else {
    const htmlTemplate = getIndexHtml();
    res.set('Content-Type', 'text/html');
    res.send(injectNonce(htmlTemplate, nonce));
  }
});

app.get('/help.html', (req, res) => {
  const nonce = res.locals.nonce;
  if (IS_PROD) {
    try {
      const htmlTemplate = getHelpHtml();
      const assets = getAssetPaths();
      const injectedHtml = injectNonce(htmlTemplate, nonce)
        .replace('<link rel="stylesheet" href="styles.css">', `<link rel="stylesheet" href="${assets.css}">`);
      
      res.set('Content-Type', 'text/html');
      res.send(injectedHtml);
    } catch (e) {
      console.error('Error serving modified help.html:', e);
      res.status(500).send('Server error serving HTML');
    }
  } else {
    const htmlTemplate = getHelpHtml();
    res.set('Content-Type', 'text/html');
    res.send(injectNonce(htmlTemplate, nonce));
  }
});

// Block unminified source files in production
if (IS_PROD) {
  app.use((req, res, next) => {
    const blocked = ['/app.js', '/styles.css', '/styles.min.css', '/icon.html'];
    if (blocked.some(p => req.path === p)) {
      return res.status(404).end();
    }
    next();
  });
}

// Serve static files (after HTML routes)
app.use(express.static('public', {
  index: false,
  dotfiles: 'deny',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.webp')) {
      res.set('Content-Type', 'image/webp');
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
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
  // Don't exit on expected errors (e.g. broken pipe, browser disconnect)
  if (err.code === 'ECONNRESET' || err.code === 'ERR_HTTP2_SESSION_ERROR') return;
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  // Log but don't exit — unhandled rejections shouldn't crash the server
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
