import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper function to ensure directory exists
const ensureDirExists = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirExists(dirname);
  fs.mkdirSync(dirname);
};

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const PUBLIC_DIR = path.join(__dirname, '../public');
const DIST_DIR = path.join(__dirname, '../dist');
const HTML_TEMPLATE_PATH = path.join(PUBLIC_DIR, 'index.html');
const ESBUILD_META_PATH = path.join(__dirname, '../esbuild-meta.json');
const CSS_MANIFEST_PATH = path.join(__dirname, '.css-manifest.txt');

// --- Main Function ---
function generateStaticSite() {
  console.log('Generating static site...');

  // 1. Clean and create dist directory
  console.log(`Cleaning and creating ${DIST_DIR}...`);
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // 2. Read hashed asset filenames
  console.log('Reading asset manifests...');
  let jsFilename = 'app.js'; // Default fallback
  let cssFilename = 'styles.css'; // Default fallback

  try {
    if (fs.existsSync(ESBUILD_META_PATH)) {
      const meta = JSON.parse(fs.readFileSync(ESBUILD_META_PATH, 'utf8'));
      const outputKey = Object.keys(meta.outputs).find(key => meta.outputs[key].entryPoint === 'public/app.js');
      if (outputKey) {
        // Get the filename relative to the public dir
        jsFilename = path.relative(PUBLIC_DIR, path.join(__dirname, '../', outputKey)).replace(/\\/g, '/');
        console.log(`  Found JS asset: ${jsFilename}`);
      } else {
        console.warn('  Warning: Could not find JS entry point in esbuild-meta.json');
      }
    } else {
      console.warn(`  Warning: ${ESBUILD_META_PATH} not found. Using default JS filename.`);
    }
  } catch (e) {
    console.error('  Error reading JS metafile:', e);
  }

  try {
    if (fs.existsSync(CSS_MANIFEST_PATH)) {
      cssFilename = fs.readFileSync(CSS_MANIFEST_PATH, 'utf8').trim();
       console.log(`  Found CSS asset: ${cssFilename}`);
    } else {
       console.warn(`  Warning: ${CSS_MANIFEST_PATH} not found. Using default CSS filename.`);
    }
  } catch (e) {
    console.error('  Error reading CSS manifest:', e);
  }

  // 3. Process and inject into index.html
  console.log(`Processing ${HTML_TEMPLATE_PATH}...`);
  try {
    const htmlTemplate = fs.readFileSync(HTML_TEMPLATE_PATH, 'utf8');
    const injectedHtml = htmlTemplate
      .replace('<!-- CSS_FILENAME -->', `<link rel="stylesheet" href="/${cssFilename}">`)
      .replace('<!-- JS_FILENAME -->', `<script src="/${jsFilename}"></script>`);
      
    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), injectedHtml);
    console.log(`  Generated dist/index.html with injected assets.`);

  } catch (e) {
    console.error('  Error processing index.html:', e);
    process.exit(1); // Exit if template processing fails
  }
  
  // 4. Copy necessary static assets
  console.log('Copying static assets...');
  const assetsToCopy = [
    // Hashed files (relative to PUBLIC_DIR)
    jsFilename,
    cssFilename,
    // Other essential files
    'help.html',
    'manifest.json',
    'verses.json',
    // Icons (add any other icons you have)
    'icon-192.png',
    // 'icon-512.png',
    // 'icon.svg',
    // 'apple-touch-icon.png',
    // 'apple-touch-icon-precomposed.png'
  ];

  assetsToCopy.forEach(file => {
    const sourcePath = path.join(PUBLIC_DIR, file);
    const destPath = path.join(DIST_DIR, file);
    if (fs.existsSync(sourcePath)) {
      try {
        ensureDirExists(destPath); // Ensure destination directory exists
        fs.copyFileSync(sourcePath, destPath);
        console.log(`  Copied: ${file}`);
      } catch (copyError) {
        console.error(`  Error copying ${file}:`, copyError);
      }
    } else {
      console.warn(`  Warning: Asset not found, skipping copy: ${sourcePath}`);
    }
  });

  // 5. Copy images directory
  const imagesSourceDir = path.join(PUBLIC_DIR, 'images');
  const imagesDestDir = path.join(DIST_DIR, 'images');
  if (fs.existsSync(imagesSourceDir)) {
    try {
      fs.cpSync(imagesSourceDir, imagesDestDir, { recursive: true });
      console.log(`  Copied: images/ directory`);
    } catch (copyError) {
      console.error(`  Error copying images directory:`, copyError);
    }
  } else {
    console.warn(`  Warning: images directory not found, skipping: ${imagesSourceDir}`);
  }

  console.log('\nStatic site generation complete in dist/ directory.');
}

// --- Run Script ---
generateStaticSite(); 