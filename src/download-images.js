import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

// Theme colors for gradient background images
const THEME_COLORS = {
  love: { light: ['#ffd6d6', '#ffecec'], dark: ['#4d2626', '#332626'] },
  guidance: { light: ['#d6e6ff', '#ecf2ff'], dark: ['#26334d', '#262d33'] },
  trust: { light: ['#e6d6ff', '#f2ecff'], dark: ['#33264d', '#2d2633'] },
  strength: { light: ['#d6ffd6', '#ecffec'], dark: ['#264d26', '#263326'] },
  purpose: { light: ['#ffd6e6', '#ffecf2'], dark: ['#4d2633', '#33262d'] },
  rest: { light: ['#d6fff0', '#ecfff7'], dark: ['#264d3d', '#26332f'] },
  hope: { light: ['#fff0d6', '#fff7ec'], dark: ['#4d3d26', '#332f26'] },
  future: { light: ['#e6ffd6', '#f2ffec'], dark: ['#334d26', '#2d3326'] },
  transformation: { light: ['#ffd6ff', '#ffecff'], dark: ['#4d264d', '#332633'] },
  newness: { light: ['#d6ffff', '#ecffff'], dark: ['#264d4d', '#263333'] },
  refuge: { light: ['#ffe6d6', '#fff2ec'], dark: ['#4d3326', '#332d26'] },
  fruit: { light: ['#ffd6e6', '#ffecf2'], dark: ['#4d2633', '#33262d'] },
  faith: { light: ['#e6d6ff', '#f2ecff'], dark: ['#33264d', '#2d2633'] },
  wisdom: { light: ['#d6e6ff', '#ecf2ff'], dark: ['#26334d', '#262d33'] },
  care: { light: ['#ffd6d6', '#ffecec'], dark: ['#4d2626', '#332626'] },
  courage: { light: ['#ffe6d6', '#fff2ec'], dark: ['#4d3326', '#332d26'] },
  mission: { light: ['#d6ffe6', '#ecfff2'], dark: ['#264d33', '#26332d'] },
  creation: { light: ['#d6d6ff', '#ececff'], dark: ['#26264d', '#262633'] },
  heaven: { light: ['#d6e6ff', '#ecf2ff'], dark: ['#26334d', '#262d33'] },
  salvation: { light: ['#ffd6d6', '#ffecec'], dark: ['#4d2626', '#332626'] },
  stewardship: { light: ['#d6ffd6', '#ecffec'], dark: ['#264d26', '#263326'] },
  evangelism: { light: ['#fff0d6', '#fff7ec'], dark: ['#4d3d26', '#332f26'] },
  prayer: { light: ['#e6d6ff', '#f2ecff'], dark: ['#33264d', '#2d2633'] },
  holiness: { light: ['#ffffff', '#f7f7f7'], dark: ['#404040', '#333333'] },
  joy: { light: ['#ffd6cc', '#ffece6'], dark: ['#4d261f', '#332620'] },
  discipleship: { light: ['#d6e6ff', '#ecf2ff'], dark: ['#26334d', '#262d33'] },
  service: { light: ['#ffd6e6', '#ffecf2'], dark: ['#4d2633', '#33262d'] },
  unity: { light: ['#e6d6ff', '#f2ecff'], dark: ['#33264d', '#2d2633'] },
  peace: { light: ['#d6fff0', '#ecfff7'], dark: ['#264d45', '#263333'] },
  worship: { light: ['#ffe6cc', '#fff2e6'], dark: ['#4d3326', '#332920'] }
};

/**
 * Create directory if it doesn't exist
 * @param {string} dir Directory path
 */
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Generate a gradient image
 * @param {string} dest Destination path
 * @param {string} theme Theme name
 * @param {boolean} isDark Whether this is a dark variant
 */
async function generateFallbackImage(dest, theme, isDark) {
  const variant = isDark ? 'dark' : 'light';
  const [color1, color2] = THEME_COLORS[theme][variant];
  
  const width = 1920;
  const height = 1080;
  
  // Create a gradient background
  const svg = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="sans-serif" 
        font-size="48" 
        font-weight="bold" 
        fill="${isDark ? '#404040' : '#f0f0f0'}" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >
        ${theme.toUpperCase()}
      </text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 90 })
    .toFile(dest);
}

/**
 * Download all theme images
 */
async function downloadThemeImages() {
  console.log('Starting background image download...');
  
  try {
    // Ensure images directory exists
    ensureDirectoryExists(IMAGES_DIR);
    
    let downloaded = 0;
    const total = Object.keys(THEME_COLORS).length * 2; // Light and dark variants
    
    // Generate images for each theme
    for (const theme of Object.keys(THEME_COLORS)) {
      // Generate light variant
      const filename = `bg-${theme}.jpg`;
      const destPath = path.join(IMAGES_DIR, filename);
      
      if (fs.existsSync(destPath)) {
        console.log(`${filename} already exists, skipping...`);
        downloaded++;
      } else {
        try {
          await generateFallbackImage(destPath, theme, false);
          downloaded++;
          console.log(`Generated ${filename} (${downloaded}/${total})`);
        } catch (err) {
          console.error(`Failed to generate ${filename}:`, err.message);
        }
      }
      
      // Generate dark variant
      const darkFilename = `bg-${theme}-dark.jpg`;
      const darkDestPath = path.join(IMAGES_DIR, darkFilename);
      
      if (fs.existsSync(darkDestPath)) {
        console.log(`${darkFilename} already exists, skipping...`);
        downloaded++;
      } else {
        try {
          await generateFallbackImage(darkDestPath, theme, true);
          downloaded++;
          console.log(`Generated ${darkFilename} (${downloaded}/${total})`);
        } catch (err) {
          console.error(`Failed to generate ${darkFilename}:`, err.message);
        }
      }
    }
    
    console.log(`\nDownload complete! Successfully downloaded ${downloaded}/${total} images.`);
  } catch (err) {
    console.error('Error during image generation:', err);
    process.exit(1);
  }
}

// Run the download
downloadThemeImages(); 