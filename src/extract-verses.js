import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pre-selected verses with their themes
const verseData = [
  {
    reference: "John 3:16",
    text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    theme: "love"
  },
  {
    reference: "Psalm 23:1",
    text: "The LORD is my shepherd, I lack nothing.",
    theme: "guidance"
  },
  {
    reference: "Proverbs 3:5-6",
    text: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    theme: "trust"
  },
  {
    reference: "Philippians 4:13",
    text: "I can do all this through him who gives me strength.",
    theme: "strength"
  },
  {
    reference: "Romans 8:28",
    text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    theme: "purpose"
  },
  {
    reference: "Matthew 11:28",
    text: "Come to me, all you who are weary and burdened, and I will give you rest.",
    theme: "rest"
  },
  {
    reference: "Isaiah 40:31",
    text: "But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
    theme: "hope"
  },
  {
    reference: "Jeremiah 29:11",
    text: '"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."',
    theme: "future"
  },
  {
    reference: "Romans 12:2",
    text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God's will is—his good, pleasing and perfect will.",
    theme: "transformation"
  },
  {
    reference: "2 Corinthians 5:17",
    text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!",
    theme: "newness"
  },
  {
    reference: "Psalm 46:1",
    text: "God is our refuge and strength, an ever-present help in trouble.",
    theme: "refuge"
  },
  {
    reference: "Galatians 5:22-23",
    text: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control. Against such things there is no law.",
    theme: "fruit"
  },
  {
    reference: "Hebrews 11:1",
    text: "Now faith is confidence in what we hope for and assurance about what we do not see.",
    theme: "faith"
  },
  {
    reference: "James 1:5",
    text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.",
    theme: "wisdom"
  },
  {
    reference: "1 Peter 5:7",
    text: "Cast all your anxiety on him because he cares for you.",
    theme: "care"
  },
  {
    reference: "Joshua 1:9",
    text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.",
    theme: "courage"
  },
  {
    reference: "Matthew 28:19-20",
    text: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.",
    theme: "mission"
  },
  {
    reference: "1 Corinthians 13:4-7",
    text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs. Love does not delight in evil but rejoices with the truth. It always protects, always trusts, always hopes, always perseveres.",
    theme: "love"
  },
  {
    reference: "Genesis 1:1",
    text: "In the beginning God created the heavens and the earth.",
    theme: "creation"
  },
  {
    reference: "Revelation 21:4",
    text: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.",
    theme: "heaven"
  }
];

async function extractVerses() {
  try {
    console.log('Starting verse extraction...');
    console.log('Preparing verse data...');

    // Add metadata to the verses
    const versesWithMetadata = {
      meta: {
        totalVerses: verseData.length,
        themes: [...new Set(verseData.map(verse => verse.theme))],
        generatedAt: new Date().toISOString(),
        source: 'NIV 1984'
      },
      verses: verseData
    };

    // Create public directory if it doesn't exist
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    // Save verses to JSON file
    const outputPath = path.join(publicDir, 'verses.json');
    fs.writeFileSync(outputPath, JSON.stringify(versesWithMetadata, null, 2));

    console.log(`Successfully saved ${verseData.length} verses to ${outputPath}`);
    console.log('Available themes:', versesWithMetadata.meta.themes.join(', '));

  } catch (error) {
    console.error('Error extracting verses:', error);
    process.exit(1);
  }
}

// Run the extraction
extractVerses(); 