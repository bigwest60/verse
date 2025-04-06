import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Load verses data
function loadVerses() {
  try {
    const versesPath = path.join(__dirname, '../public/verses.json');
    const versesData = fs.readFileSync(versesPath, 'utf8');
    return JSON.parse(versesData);
  } catch (error) {
    console.error('Error loading verses:', error);
    return null;
  }
}

// API route to get a random verse
app.get('/api/verse', (req, res) => {
  try {
    const versesData = loadVerses();
    
    if (!versesData) {
      throw new Error('Failed to load verses data');
    }
    
    const verses = versesData.verses;
    const randomIndex = Math.floor(Math.random() * verses.length);
    const randomVerse = verses[randomIndex];
    
    res.json(randomVerse);
  } catch (error) {
    console.error('Error fetching random verse:', error);
    res.status(500).json({ error: 'Failed to fetch verse' });
  }
});

// API route to get verse metadata
app.get('/api/meta', (req, res) => {
  try {
    const versesData = loadVerses();
    
    if (!versesData) {
      throw new Error('Failed to load verses data');
    }
    
    res.json(versesData.meta);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 