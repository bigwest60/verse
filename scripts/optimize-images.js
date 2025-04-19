import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '../public/images');
const SIZES = [480, 768, 1080, 1920]; // Responsive image sizes

async function optimizeImage(inputPath, theme, isDark) {
  const filename = path.basename(inputPath, '.jpg');
  const outputDir = path.dirname(inputPath);

  // Create WebP versions in different sizes
  for (const width of SIZES) {
    const outputWebP = path.join(outputDir, `${filename}-${width}.webp`);
    const outputJPG = path.join(outputDir, `${filename}-${width}.jpg`);

    // Skip if files already exist
    if (fs.existsSync(outputWebP) && fs.existsSync(outputJPG)) {
      console.log(`Skipping ${filename}-${width}, already exists`);
      continue;
    }

    try {
      // Create WebP version
      await sharp(inputPath)
        .resize(width, Math.floor(width * 9/16))
        .webp({ quality: 80 })
        .toFile(outputWebP);

      // Create JPG version (as fallback)
      await sharp(inputPath)
        .resize(width, Math.floor(width * 9/16))
        .jpeg({ quality: 80, progressive: true })
        .toFile(outputJPG);

      console.log(`Generated ${filename}-${width} (WebP + JPG)`);
    } catch (err) {
      console.error(`Error optimizing ${filename}-${width}:`, err);
    }
  }
}

async function optimizeAllImages() {
  try {
    // Ensure images directory exists
    if (!fs.existsSync(IMAGES_DIR)) {
      console.error('Images directory not found. Run npm run prepare first.');
      process.exit(1);
    }

    const files = fs.readdirSync(IMAGES_DIR);
    // Adjusted filter: Find .jpg files that are NOT already sized (e.g., ending in -###.jpg)
    const imageFiles = files.filter(file => file.endsWith('.jpg') && !/-\d+\.jpg$/.test(file));

    console.log(`Found ${imageFiles.length} base images to optimize...`);

    for (const file of imageFiles) {
      const inputPath = path.join(IMAGES_DIR, file);
      const theme = file.replace('bg-', '').replace('-dark', '').replace('.jpg', '');
      const isDark = file.includes('-dark');

      await optimizeImage(inputPath, theme, isDark);
    }

    console.log('\nImage optimization complete!');
  } catch (err) {
    console.error('Error during image optimization:', err);
    process.exit(1);
  }
}

// Run optimization
optimizeAllImages(); 