# Bible Verse Website

A simple, elegant website that displays random Bible verses with themed background images.

## Features

- Random Bible verse display
- Themed background images
- Mobile-responsive design
- Smooth transitions
- One-click verse refresh

## Project Structure

```
project/
├── src/
│   ├── index.js              # Express server
│   ├── extract-verses.js     # Verse preparation script
│   └── download-images.js    # Image downloader
├── public/
│   ├── index.html           # Main webpage
│   ├── styles.css           # Styling
│   ├── script.js            # Frontend logic
│   ├── verses.json          # Verse data
│   └── images/              # Background images
└── files/
    └── whole_bible_niv1984.pdf  # Source Bible
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Prepare verse data and images:
   ```bash
   npm run prepare
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Visit http://localhost:3000 in your browser

## Scripts

- `npm run prepare`: Extract verses and download background images
- `npm start`: Start the Express server
- `npm run setup`: Run preparation and start server

## Development

The project uses:
- Express.js for the backend
- Pure HTML/CSS/JavaScript for the frontend
- PDF parsing for Bible verse extraction
- JSON for data storage
- CDN for background images

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.