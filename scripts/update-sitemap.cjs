const fs = require('fs');
const path = require('path');

const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
const publicDir = path.join(__dirname, '..', 'public');

console.log(`Updating sitemap at: ${sitemapPath}`);
console.log(`Using public directory: ${publicDir}`);

try {
  if (!fs.existsSync(sitemapPath)) {
    throw new Error(`Sitemap file not found at ${sitemapPath}`);
  }

  let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  let changesMade = false;

  // Regex to find each <url> block and capture <loc> and <lastmod> content
  sitemapContent = sitemapContent.replace(/<url>\s*<loc>(.*?)<\/loc>([\s\S]*?)<lastmod>(.*?)<\/lastmod>([\s\S]*?)<\/url>/g, (match, loc, between1, oldLastmod, between2) => {
    const url = loc.trim();
    let htmlFileName;
    try {
        // Extract pathname from the full URL
        const urlObject = new URL(url);
        const relativePath = urlObject.pathname;
        htmlFileName = relativePath === '/' ? 'index.html' : relativePath.substring(1);
    } catch (e) {
        console.warn(`Could not parse URL: ${url}. Skipping this entry.`);
        return match; // Return the original block if URL parsing fails
    }
    
    const htmlFilePath = path.join(publicDir, htmlFileName);
    
    console.log(` Processing URL: ${url} -> File: ${htmlFilePath}`);

    if (fs.existsSync(htmlFilePath)) {
      const stats = fs.statSync(htmlFilePath);
      const lastModDate = stats.mtime.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      if (oldLastmod.trim() !== lastModDate) {
        console.log(`  Updating lastmod for ${htmlFileName}: ${oldLastmod.trim()} -> ${lastModDate}`);
        changesMade = true;
        // Reconstruct the <url> block with the new date
        // Ensure proper indentation
        return `<url>\n    <loc>${loc}</loc>${between1.replace(/\n\s*$/, '\n    ')}<lastmod>${lastModDate}</lastmod>${between2.replace(/^\s*\n/, '\n    ')}</url>`;
      } else {
        console.log(`  Lastmod date for ${htmlFileName} is already up-to-date (${lastModDate}).`);
        return match; // Return unchanged block
      }
    } else {
      console.warn(`  HTML file not found for ${url}: ${htmlFilePath}. Skipping update.`);
      return match; // Return unchanged block if file doesn't exist
    }
  });

  if (changesMade) {
    fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
    console.log('Successfully updated sitemap.xml lastmod dates.');
  } else {
    console.log('No changes needed for sitemap.xml lastmod dates.');
  }

} catch (error) {
  console.error('Error updating sitemap.xml:', error);
  process.exit(1); // Exit with error code
} 