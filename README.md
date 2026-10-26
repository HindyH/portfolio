# Hindy Hamburger Portfolio

![CI](https://github.com/HindyH/portfolio/actions/workflows/ci.yml/badge.svg)

Source code for my personal art portfolio: **[hindyhamburger.vercel.app](https://hindyhamburger.vercel.app)**

## About
I'm an artist and designer working across drawing, painting, sculpture, digital illustration, crochet, and photography, and I'm pursuing a career in art therapy. I studied Computer Science with a minor in Studio Art at Yeshiva University, and I designed and built this site myself (with AI assistance from Claude) to present my work.

## Tech Stack
* Next.js (App Router) - framework
* TypeScript - language
* Tailwind CSS - styling
* Vercel - hosting/deployment
* Vercel Blob - image and video storage
* Python (Pillow, ColorThief) + ffmpeg - media processing pipeline

## Features
* Responsive homepage with a rotating "corkboard" of pinned artwork, photos and videos, respecting `prefers-reduced-motion` for visitors who've asked their OS for less animation.
* Artwork and Photography galleries, each organized into categories with dedicated pages per piece.
* Video support alongside images: `process_images.py` extracts a poster frame, generates responsive sizes, a placeholder, and a dominant color from it, and converts the video to a web-optimized H.264/AAC mp4 via ffmpeg.
* Custom image pipeline (`process_images.py`) that generates multiple image sizes and blurred base64 placeholders for fast, responsive loading, with a `--new-only` mode to process just newly added files without touching anything already published.
* Content-hashed URLs for uploaded media (`scripts/migrate-images-to-blob.mjs`), so replacing a file's content always produces a fresh, correctly cached URL.
* `scripts/prune-unused-blobs.mjs` - a dry-run-by-default cleanup script that finds and removes unused files on Blob storage.

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
metadata.json, metadata-photos.json     # Per-item title/year/medium/category info
process_images.py                       # Image + video processing script
scripts/migrate-images-to-blob.mjs      # Uploads processed media to Vercel Blob
scripts/prune-unused-blobs.mjs          # Cleans up orphaned files on Blob storage
```

## Deployment
Deployed on [Vercel](https://vercel.com). Pushes to main auto-deploy.

## Contact
* Portfolio: [hindyhamburger.vercel.app](https://hindyhamburger.vercel.app)
* Email: hindyhamburger@gmail.com
* LinkedIn: [linkedin.com/in/hindy-hamburger](https://www.linkedin.com/in/hindy-hamburger/)
* GitHub: [github.com/HindyH](https://github.com/HindyH)
