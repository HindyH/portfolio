# Hindy Hamburger Portfolio

![CI](https://github.com/HindyH/portfolio/actions/workflows/ci.yml/badge.svg)

Personal portfolio and resume site. Built with Next.js with AI assistance from Claude. Showcases software engineering work alongside artwork and photography.

## About
Majored in Computer Science and minored in Studio Art, this site doubles as a portfolio for software engineering roles as well as a gallery for personal artwork.

## Tech Stack
* Next.js (App Router) - framework
* TypeScript - language
* Tailwind CSS - styling
* Vercel - hosting/deployment
* Vercel Blob - image and video storage
* Python (Pillow, ColorThief) + ffmpeg - media processing pipeline

## Features
* Responsive homepage with a rotating "corkboard" of pinned photos and videos, respecting `prefers-reduced-motion` for visitors who've asked their OS for less animation.
* Artwork and Photography galleries, each organized into categories with dedicated pages per piece, sorted alphabetically.
* Video support alongside images: `process_images.py` extracts a poster frame, generates responsive sizes/placeholder/dominant color from it, and translates to a web-optimized H.264/AAC mp4 via ffmpeg.
* Custom image pipeline (`process_images.py`) that generates multiple image sizes and blurred base64 placeholders for fast, responsive loading, with a `--new-only` mode to process just newly-added files without touching anything already published.
* Content-hashed URLs for uploaded media (`scripts/migrate-images-to-blob.mjs`), so replacing a file's content always produces a fresh, correctly-cached URL.
* `scripts/prune-unused-blobs.mjs` - a dry-run-by-default cleanup script that finds and removes files on Blob storage.

## Getting Started
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it locally.

Processing and publishing new artwork/photos/videos requires Python (Pillow, colorthief) and `ffmpeg`/`ffprobe` on PATH for video files.

## Project Structure
```
app/                                    # Pages and routes
lib/                                    # Shared utilities
types/                                  # TypeScript types
public/                                 # Static assets
raw-art/, raw-photos/                   # Source files (gitignored) - not committed
artworks.json, photos.json              # Gallery manifests
metadata.json, metadata-photos.json.    # Per-item title/year/medium/category info
process_images.py                       # Image + video processing script
scripts/migrate-images-to-blob.mjs      # Uploads processed media to Vercel Blob
scripts/prune-unused-blobs.mjs          # Cleans up orphaned files on Blob storage
```

## Deployment
Deployed on [Vercel](https://vercel.com). Pushes to main auto-deploy.

## Contact
* Email: hindyhamburger@gmail.com
* LinkedIn: www.linkedin.com/in/hindy-hamburger-1737a63b2
* GitHub: github.com/HindyH
