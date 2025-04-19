import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '../public');
const CSS_MANIFEST_PATH = path.join(__dirname, '.css-manifest.txt');

async function hashCss() {
  let cssContent = '';

  process.stdin.setEncoding('utf8');

  for await (const chunk of process.stdin) {
    cssContent += chunk;
  }

  if (!cssContent) {
    console.error('Error: No CSS content received from stdin.');
    process.exit(1);
  }

  // Remove old hashed CSS files
  try {
    const files = fs.readdirSync(PUBLIC_DIR);
    files.forEach(file => {
      if (file.startsWith('styles-') && file.endsWith('.min.css')) {
        fs.unlinkSync(path.join(PUBLIC_DIR, file));
        // console.log(`Removed old file: ${file}`);
      }
    });
  } catch (err) {
    console.error('Error removing old CSS files:', err);
    // Continue even if removal fails
  }

  // Calculate hash
  const hash = crypto.createHash('sha256').update(cssContent).digest('hex').slice(0, 8);
  const newFilename = `styles-${hash}.min.css`;
  const outputPath = path.join(PUBLIC_DIR, newFilename);

  // Write new hashed file
  try {
    fs.writeFileSync(outputPath, cssContent);
    // Write the filename to a manifest file for the server to read
    fs.writeFileSync(CSS_MANIFEST_PATH, newFilename);
    console.log(newFilename); // Output the generated filename to stdout as well
  } catch (err) {
    console.error(`Error writing hashed CSS file ${outputPath}:`, err);
    process.exit(1);
  }
}

hashCss(); 