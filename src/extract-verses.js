import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pre-selected verses with their themes - expanded to 100 verses
const verseData = [
  // Love theme verses
  {
    reference: "John 3:16",
    text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    theme: "love"
  },
  {
    reference: "1 Corinthians 13:4-7",
    text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs. Love does not delight in evil but rejoices with the truth. It always protects, always trusts, always hopes, always perseveres.",
    theme: "love"
  },
  {
    reference: "1 John 4:7-8",
    text: "Dear friends, let us love one another, for love comes from God. Everyone who loves has been born of God and knows God. Whoever does not love does not know God, because God is love.",
    theme: "love"
  },
  {
    reference: "Romans 5:8",
    text: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.",
    theme: "love"
  },
  {
    reference: "John 15:13",
    text: "Greater love has no one than this: to lay down one's life for one's friends.",
    theme: "love"
  },
  {
    reference: "1 John 4:19",
    text: "We love because he first loved us.",
    theme: "love"
  },

  // Guidance theme verses
  {
    reference: "Psalm 23:1",
    text: "The LORD is my shepherd, I lack nothing.",
    theme: "guidance"
  },
  {
    reference: "Psalm 32:8",
    text: "I will instruct you and teach you in the way you should go; I will counsel you with my loving eye on you.",
    theme: "guidance"
  },
  {
    reference: "Psalm 119:105",
    text: "Your word is a lamp for my feet, a light on my path.",
    theme: "guidance"
  },
  {
    reference: "James 1:5-6",
    text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you. But when you ask, you must believe and not doubt.",
    theme: "guidance"
  },
  {
    reference: "Isaiah 30:21",
    text: "Whether you turn to the right or to the left, your ears will hear a voice behind you, saying, 'This is the way; walk in it.'",
    theme: "guidance"
  },

  // Trust theme verses
  {
    reference: "Proverbs 3:5-6",
    text: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    theme: "trust"
  },
  {
    reference: "Psalm 9:10",
    text: "Those who know your name trust in you, for you, LORD, have never forsaken those who seek you.",
    theme: "trust"
  },
  {
    reference: "Isaiah 26:3-4",
    text: "You will keep in perfect peace those whose minds are steadfast, because they trust in you. Trust in the LORD forever, for the LORD, the LORD himself, is the Rock eternal.",
    theme: "trust"
  },
  {
    reference: "Nahum 1:7",
    text: "The LORD is good, a refuge in times of trouble. He cares for those who trust in him.",
    theme: "trust"
  },
  {
    reference: "Psalm 56:3-4",
    text: "When I am afraid, I put my trust in you. In God, whose word I praise—in God I trust and am not afraid. What can mere mortals do to me?",
    theme: "trust"
  },

  // Strength theme verses
  {
    reference: "Philippians 4:13",
    text: "I can do all this through him who gives me strength.",
    theme: "strength"
  },
  {
    reference: "Isaiah 40:31",
    text: "But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
    theme: "strength"
  },
  {
    reference: "Psalm 28:7",
    text: "The LORD is my strength and my shield; my heart trusts in him, and he helps me. My heart leaps for joy, and with my song I praise him.",
    theme: "strength"
  },
  {
    reference: "2 Corinthians 12:9-10",
    text: "But he said to me, 'My grace is sufficient for you, for my power is made perfect in weakness.' Therefore I will boast all the more gladly about my weaknesses, so that Christ's power may rest on me.",
    theme: "strength"
  },
  {
    reference: "Ephesians 6:10",
    text: "Finally, be strong in the Lord and in his mighty power.",
    theme: "strength"
  },

  // Purpose theme verses
  {
    reference: "Romans 8:28",
    text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    theme: "purpose"
  },
  {
    reference: "Ephesians 2:10",
    text: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.",
    theme: "purpose"
  },
  {
    reference: "Proverbs 19:21",
    text: "Many are the plans in a person's heart, but it is the LORD's purpose that prevails.",
    theme: "purpose"
  },
  {
    reference: "Jeremiah 1:5",
    text: "Before I formed you in the womb I knew you, before you were born I set you apart; I appointed you as a prophet to the nations.",
    theme: "purpose"
  },
  {
    reference: "Philippians 1:6",
    text: "Being confident of this, that he who began a good work in you will carry it on to completion until the day of Christ Jesus.",
    theme: "purpose"
  },

  // Rest theme verses
  {
    reference: "Matthew 11:28",
    text: "Come to me, all you who are weary and burdened, and I will give you rest.",
    theme: "rest"
  },
  {
    reference: "Psalm 23:2-3",
    text: "He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.",
    theme: "rest"
  },
  {
    reference: "Exodus 33:14",
    text: "The LORD replied, 'My Presence will go with you, and I will give you rest.'",
    theme: "rest"
  },
  {
    reference: "Hebrews 4:9-11",
    text: "There remains, then, a Sabbath-rest for the people of God; for anyone who enters God's rest also rests from their works, just as God did from his.",
    theme: "rest"
  },
  {
    reference: "Psalm 62:1-2",
    text: "Truly my soul finds rest in God; my salvation comes from him. Truly he is my rock and my salvation; he is my fortress, I will never be shaken.",
    theme: "rest"
  },

  // Hope theme verses
  {
    reference: "Isaiah 40:31",
    text: "But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
    theme: "hope"
  },
  {
    reference: "Romans 15:13",
    text: "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.",
    theme: "hope"
  },
  {
    reference: "Psalm 42:11",
    text: "Why, my soul, are you downcast? Why so disturbed within me? Put your hope in God, for I will yet praise him, my Savior and my God.",
    theme: "hope"
  },
  {
    reference: "Romans 5:3-5",
    text: "Not only so, but we also glory in our sufferings, because we know that suffering produces perseverance; perseverance, character; and character, hope. And hope does not put us to shame.",
    theme: "hope"
  },
  {
    reference: "Lamentations 3:21-23",
    text: "Yet this I call to mind and therefore I have hope: Because of the LORD's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.",
    theme: "hope"
  },

  // Future theme verses
  {
    reference: "Jeremiah 29:11",
    text: '"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."',
    theme: "future"
  },
  {
    reference: "Philippians 3:13-14",
    text: "Brothers and sisters, I do not consider myself yet to have taken hold of it. But one thing I do: Forgetting what is behind and straining toward what is ahead, I press on toward the goal to win the prize for which God has called me heavenward in Christ Jesus.",
    theme: "future"
  },
  {
    reference: "2 Corinthians 4:17-18",
    text: "For our light and momentary troubles are achieving for us an eternal glory that far outweighs them all. So we fix our eyes not on what is seen, but on what is unseen, since what is seen is temporary, but what is unseen is eternal.",
    theme: "future"
  },
  {
    reference: "Revelation 21:5",
    text: "He who was seated on the throne said, 'I am making everything new!' Then he said, 'Write this down, for these words are trustworthy and true.'",
    theme: "future"
  },
  {
    reference: "Proverbs 23:18",
    text: "There is surely a future hope for you, and your hope will not be cut off.",
    theme: "future"
  },

  // Transformation theme verses
  {
    reference: "Romans 12:2",
    text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God's will is—his good, pleasing and perfect will.",
    theme: "transformation"
  },
  {
    reference: "2 Corinthians 3:18",
    text: "And we all, who with unveiled faces contemplate the Lord's glory, are being transformed into his image with ever-increasing glory, which comes from the Lord, who is the Spirit.",
    theme: "transformation"
  },
  {
    reference: "Psalm 51:10",
    text: "Create in me a pure heart, O God, and renew a steadfast spirit within me.",
    theme: "transformation"
  },
  {
    reference: "Ezekiel 36:26",
    text: "I will give you a new heart and put a new spirit in you; I will remove from you your heart of stone and give you a heart of flesh.",
    theme: "transformation"
  },
  {
    reference: "Philippians 1:6",
    text: "Being confident of this, that he who began a good work in you will carry it on to completion until the day of Christ Jesus.",
    theme: "transformation"
  },

  // Newness theme verses
  {
    reference: "2 Corinthians 5:17",
    text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!",
    theme: "newness"
  },
  {
    reference: "Isaiah 43:19",
    text: "See, I am doing a new thing! Now it springs up; do you not perceive it? I am making a way in the wilderness and streams in the wasteland.",
    theme: "newness"
  },
  {
    reference: "Lamentations 3:22-23",
    text: "Because of the LORD's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.",
    theme: "newness"
  },
  {
    reference: "Revelation 21:5",
    text: "He who was seated on the throne said, 'I am making everything new!' Then he said, 'Write this down, for these words are trustworthy and true.'",
    theme: "newness"
  },
  {
    reference: "Ephesians 4:22-24",
    text: "You were taught, with regard to your former way of life, to put off your old self, which is being corrupted by its deceitful desires; to be made new in the attitude of your minds; and to put on the new self, created to be like God in true righteousness and holiness.",
    theme: "newness"
  },

  // Refuge theme verses
  {
    reference: "Psalm 46:1",
    text: "God is our refuge and strength, an ever-present help in trouble.",
    theme: "refuge"
  },
  {
    reference: "Psalm 91:1-2",
    text: "Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the LORD, 'He is my refuge and my fortress, my God, in whom I trust.'",
    theme: "refuge"
  },
  {
    reference: "Proverbs 18:10",
    text: "The name of the LORD is a fortified tower; the righteous run to it and are safe.",
    theme: "refuge"
  },
  {
    reference: "Psalm 62:6-8",
    text: "Truly he is my rock and my salvation; he is my fortress, I will not be shaken. My salvation and my honor depend on God; he is my mighty rock, my refuge. Trust in him at all times, you people; pour out your hearts to him, for God is our refuge.",
    theme: "refuge"
  },
  {
    reference: "Psalm 27:5",
    text: "For in the day of trouble he will keep me safe in his dwelling; he will hide me in the shelter of his sacred tent and set me high upon a rock.",
    theme: "refuge"
  },

  // Fruit theme verses
  {
    reference: "Galatians 5:22-23",
    text: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control. Against such things there is no law.",
    theme: "fruit"
  },
  {
    reference: "John 15:5",
    text: "I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit; apart from me you can do nothing.",
    theme: "fruit"
  },
  {
    reference: "Colossians 1:10",
    text: "So that you may live a life worthy of the Lord and please him in every way: bearing fruit in every good work, growing in the knowledge of God.",
    theme: "fruit"
  },
  {
    reference: "Matthew 7:17-20",
    text: "Likewise, every good tree bears good fruit, but a bad tree bears bad fruit. A good tree cannot bear bad fruit, and a bad tree cannot bear good fruit. Every tree that does not bear good fruit is cut down and thrown into the fire. Thus, by their fruit you will recognize them.",
    theme: "fruit"
  },
  {
    reference: "Philippians 1:11",
    text: "Filled with the fruit of righteousness that comes through Jesus Christ—to the glory and praise of God.",
    theme: "fruit"
  },

  // Faith theme verses
  {
    reference: "Hebrews 11:1",
    text: "Now faith is confidence in what we hope for and assurance about what we do not see.",
    theme: "faith"
  },
  {
    reference: "Mark 11:22-24",
    text: "Have faith in God. Truly I tell you, if anyone says to this mountain, 'Go, throw yourself into the sea,' and does not doubt in their heart but believes that what they say will happen, it will be done for them.",
    theme: "faith"
  },
  {
    reference: "Romans 10:17",
    text: "Consequently, faith comes from hearing the message, and the message is heard through the word about Christ.",
    theme: "faith"
  },
  {
    reference: "2 Corinthians 5:7",
    text: "For we live by faith, not by sight.",
    theme: "faith"
  },
  {
    reference: "Hebrews 11:6",
    text: "And without faith it is impossible to please God, because anyone who comes to him must believe that he exists and that he rewards those who earnestly seek him.",
    theme: "faith"
  },

  // Wisdom theme verses
  {
    reference: "James 1:5",
    text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.",
    theme: "wisdom"
  },
  {
    reference: "Proverbs 1:7",
    text: "The fear of the LORD is the beginning of knowledge, but fools despise wisdom and instruction.",
    theme: "wisdom"
  },
  {
    reference: "Proverbs 3:13-14",
    text: "Blessed are those who find wisdom, those who gain understanding, for she is more profitable than silver and yields better returns than gold.",
    theme: "wisdom"
  },
  {
    reference: "Proverbs 4:6-7",
    text: "Do not forsake wisdom, and she will protect you; love her, and she will watch over you. The beginning of wisdom is this: Get wisdom. Though it cost all you have, get understanding.",
    theme: "wisdom"
  },
  {
    reference: "Colossians 2:2-3",
    text: "My goal is that they may be encouraged in heart and united in love, so that they may have the full riches of complete understanding, in order that they may know the mystery of God, namely, Christ, in whom are hidden all the treasures of wisdom and knowledge.",
    theme: "wisdom"
  },

  // Care theme verses
  {
    reference: "1 Peter 5:7",
    text: "Cast all your anxiety on him because he cares for you.",
    theme: "care"
  },
  {
    reference: "Psalm 55:22",
    text: "Cast your cares on the LORD and he will sustain you; he will never let the righteous be shaken.",
    theme: "care"
  },
  {
    reference: "Matthew 6:25-26",
    text: "Therefore I tell you, do not worry about your life, what you will eat or drink; or about your body, what you will wear. Is not life more than food, and the body more than clothes? Look at the birds of the air; they do not sow or reap or store away in barns, and yet your heavenly Father feeds them. Are you not much more valuable than they?",
    theme: "care"
  },
  {
    reference: "Philippians 4:6-7",
    text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
    theme: "care"
  },
  {
    reference: "Isaiah 41:10",
    text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.",
    theme: "care"
  },

  // Courage theme verses
  {
    reference: "Joshua 1:9",
    text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.",
    theme: "courage"
  },
  {
    reference: "Deuteronomy 31:6",
    text: "Be strong and courageous. Do not be afraid or terrified because of them, for the LORD your God goes with you; he will never leave you nor forsake you.",
    theme: "courage"
  },
  {
    reference: "1 Corinthians 16:13",
    text: "Be on your guard; stand firm in the faith; be courageous; be strong.",
    theme: "courage"
  },
  {
    reference: "Psalm 27:1",
    text: "The LORD is my light and my salvation—whom shall I fear? The LORD is the stronghold of my life—of whom shall I be afraid?",
    theme: "courage"
  },
  {
    reference: "2 Timothy 1:7",
    text: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.",
    theme: "courage"
  },

  // Mission theme verses
  {
    reference: "Matthew 28:19-20",
    text: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.",
    theme: "mission"
  },
  {
    reference: "Acts 1:8",
    text: "But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.",
    theme: "mission"
  },
  {
    reference: "Mark 16:15",
    text: "He said to them, 'Go into all the world and preach the gospel to all creation.'",
    theme: "mission"
  },
  {
    reference: "Isaiah 6:8",
    text: "Then I heard the voice of the Lord saying, 'Whom shall I send? And who will go for us?' And I said, 'Here am I. Send me!'",
    theme: "mission"
  },
  {
    reference: "Romans 10:14",
    text: "How, then, can they call on the one they have not believed in? And how can they believe in the one of whom they have not heard? And how can they hear without someone preaching to them?",
    theme: "mission"
  },

  // Creation theme verses
  {
    reference: "Genesis 1:1",
    text: "In the beginning God created the heavens and the earth.",
    theme: "creation"
  },
  {
    reference: "Psalm 19:1",
    text: "The heavens declare the glory of God; the skies proclaim the work of his hands.",
    theme: "creation"
  },
  {
    reference: "Colossians 1:16",
    text: "For in him all things were created: things in heaven and on earth, visible and invisible, whether thrones or powers or rulers or authorities; all things have been created through him and for him.",
    theme: "creation"
  },
  {
    reference: "Psalm 8:3-4",
    text: "When I consider your heavens, the work of your fingers, the moon and the stars, which you have set in place, what is mankind that you are mindful of them, human beings that you care for them?",
    theme: "creation"
  },
  {
    reference: "Isaiah 40:26",
    text: "Lift up your eyes and look to the heavens: Who created all these? He who brings out the starry host one by one and calls forth each of them by name. Because of his great power and mighty strength, not one of them is missing.",
    theme: "creation"
  },

  // Heaven theme verses
  {
    reference: "Revelation 21:4",
    text: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.",
    theme: "heaven"
  },
  {
    reference: "John 14:2-3",
    text: "My Father's house has many rooms; if that were not so, would I have told you that I am going there to prepare a place for you? And if I go and prepare a place for you, I will come back and take you to be with me that you also may be where I am.",
    theme: "heaven"
  },
  {
    reference: "Philippians 3:20",
    text: "But our citizenship is in heaven. And we eagerly await a Savior from there, the Lord Jesus Christ.",
    theme: "heaven"
  },
  {
    reference: "Revelation 7:17",
    text: "For the Lamb at the center of the throne will be their shepherd; he will lead them to springs of living water. And God will wipe away every tear from their eyes.",
    theme: "heaven"
  },
  {
    reference: "1 Corinthians 2:9",
    text: "However, as it is written: 'What no eye has seen, what no ear has heard, and what no human mind has conceived' — the things God has prepared for those who love him.",
    theme: "heaven"
  },

  // Joy theme verses
  {
    reference: "Psalm 16:11",
    text: "You make known to me the path of life; you will fill me with joy in your presence, with eternal pleasures at your right hand.",
    theme: "joy"
  },
  {
    reference: "Romans 15:13",
    text: "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.",
    theme: "joy"
  },
  {
    reference: "John 15:11",
    text: "I have told you this so that my joy may be in you and that your joy may be complete.",
    theme: "joy"
  },
  {
    reference: "Philippians 4:4",
    text: "Rejoice in the Lord always. I will say it again: Rejoice!",
    theme: "joy"
  },
  {
    reference: "Nehemiah 8:10",
    text: "The joy of the LORD is your strength.",
    theme: "joy"
  },

  // Peace theme verses
  {
    reference: "John 14:27",
    text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
    theme: "peace"
  },
  {
    reference: "Philippians 4:7",
    text: "And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
    theme: "peace"
  },
  {
    reference: "Colossians 3:15",
    text: "Let the peace of Christ rule in your hearts, since as members of one body you were called to peace. And be thankful.",
    theme: "peace"
  },
  {
    reference: "Isaiah 26:3",
    text: "You will keep in perfect peace those whose minds are steadfast, because they trust in you.",
    theme: "peace"
  },
  {
    reference: "Romans 8:6",
    text: "The mind governed by the flesh is death, but the mind governed by the Spirit is life and peace.",
    theme: "peace"
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