# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1.0] - 2026-04-21

### Changed
- Switched license from GPLv3 to MIT (matches project intent)
- Rewrote README with accurate project structure, scripts, and setup instructions
- Reorganized .gitignore — properly untracked generated files (verses.json, images)
- Removed `.gitkeep` from `public/images/` (directory created by setup script)

### Removed
- Removed dead Unsplash API code from `download-images.js` (downloadImage, getUnsplashImageUrl, THEME_IMAGES were never called)
- Removed `.env` and `.env.example` (all env vars have sensible defaults or are set by hosting platforms)
- Removed `dotenv` dependency (no longer needed)
- Removed unused env vars: UNSPLASH_ACCESS_KEY, GOOGLE_ANALYTICS_ID, AD_NETWORK_ID
- Untracked 542 generated image files and verses.json from git (these are built by `npm run setup`)