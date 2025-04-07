const fs = require("fs"); const data = JSON.parse(fs.readFileSync("public/verses.json")); const verses = data.verses; const themes = new Set(verses.map(v => v.theme)); console.log(`Actual verse count: ${verses.length}

Unique themes:
${[...themes].sort().join("
")}

Total unique themes: ${themes.size}`);
