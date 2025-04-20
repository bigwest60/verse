import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Create canvas
const canvas = createCanvas(192, 192);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#4a5568';
ctx.fillRect(0, 0, 192, 192);

// Text
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 120px system-ui';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('V', 96, 96);

// Save 192x192
const buffer192 = canvas.toBuffer('image/png');
writeFileSync(join(__dirname, '../public/icon-192.png'), buffer192);

// Resize for 512x512
const canvas512 = createCanvas(512, 512);
const ctx512 = canvas512.getContext('2d');

// Background
ctx512.fillStyle = '#4a5568';
ctx512.fillRect(0, 0, 512, 512);

// Text
ctx512.fillStyle = '#ffffff';
ctx512.font = 'bold 320px system-ui';
ctx512.textAlign = 'center';
ctx512.textBaseline = 'middle';
ctx512.fillText('V', 256, 256);

// Save 512x512
const buffer512 = canvas512.toBuffer('image/png');
writeFileSync(join(__dirname, '../public/icon-512.png'), buffer512); 