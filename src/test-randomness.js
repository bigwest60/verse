import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load verses from the JSON file
const versesPath = path.join(__dirname, '../public/verses.json');
const versesData = JSON.parse(fs.readFileSync(versesPath, 'utf8'));

// Test parameters
const NUM_TESTS = 1000;
const results = {
  themeDistribution: {},
  verseDistribution: {},
  consecutiveThemes: 0,
  consecutiveVerses: 0
};

// Initialize theme distribution counters
versesData.meta.themes.forEach(theme => {
  results.themeDistribution[theme] = 0;
});

// Initialize verse distribution counters
versesData.verses.forEach(verse => {
  results.verseDistribution[verse.reference] = 0;
});

// Run randomization tests
let previousTheme = null;
let previousVerse = null;

for (let i = 0; i < NUM_TESTS; i++) {
  const randomIndex = Math.floor(Math.random() * versesData.verses.length);
  const verse = versesData.verses[randomIndex];
  
  // Count theme occurrences
  results.themeDistribution[verse.theme]++;
  
  // Count verse occurrences
  results.verseDistribution[verse.reference]++;
  
  // Check for consecutive repeats
  if (verse.theme === previousTheme) {
    results.consecutiveThemes++;
  }
  if (verse.reference === previousVerse) {
    results.consecutiveVerses++;
  }
  
  previousTheme = verse.theme;
  previousVerse = verse.reference;
}

// Calculate statistics
const totalVerses = versesData.verses.length;
const expectedPerTheme = NUM_TESTS / versesData.meta.themes.length;
const expectedPerVerse = NUM_TESTS / totalVerses;

console.log('\nRandomization Test Results:');
console.log('==========================');
console.log(`Total tests run: ${NUM_TESTS}`);
console.log(`Total unique verses: ${totalVerses}`);
console.log(`Total unique themes: ${versesData.meta.themes.length}`);

console.log('\nTheme Distribution:');
console.log('------------------');
Object.entries(results.themeDistribution)
  .sort((a, b) => b[1] - a[1])
  .forEach(([theme, count]) => {
    const percentage = (count / NUM_TESTS * 100).toFixed(2);
    const deviation = ((count - expectedPerTheme) / expectedPerTheme * 100).toFixed(2);
    console.log(`${theme}: ${count} times (${percentage}%) - Deviation: ${deviation}%`);
  });

console.log('\nConsecutive Repeats:');
console.log('-------------------');
console.log(`Same theme appeared consecutively: ${results.consecutiveThemes} times`);
console.log(`Same verse appeared consecutively: ${results.consecutiveVerses} times`);

// Check for any verses that never appeared
const unusedVerses = Object.entries(results.verseDistribution)
  .filter(([_, count]) => count === 0)
  .map(([reference]) => reference);

if (unusedVerses.length > 0) {
  console.log('\nWarning: The following verses never appeared in the test:');
  unusedVerses.forEach(reference => console.log(`- ${reference}`));
}

// Calculate chi-square test for theme distribution
const chiSquare = Object.values(results.themeDistribution).reduce((sum, count) => {
  const difference = count - expectedPerTheme;
  return sum + (difference * difference) / expectedPerTheme;
}, 0);

console.log('\nStatistical Analysis:');
console.log('-------------------');
console.log(`Chi-square value for theme distribution: ${chiSquare.toFixed(2)}`);
console.log(`Expected occurrences per theme: ${expectedPerTheme.toFixed(2)}`);
console.log(`Expected occurrences per verse: ${expectedPerVerse.toFixed(2)}`); 