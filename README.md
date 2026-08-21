# Hindy Hamburger Portfolio

![CI](https://github.com/HindyH/portfolio/actions/workflows/ci.yml/badge.svg)

Personal portfolio and resume site. Built with Next.js with AI assistance from Claude. Showcases software projects, code, and artwork.

## About
Majored in Computer Science and minored in Studio Art, this site doubles as a portfolio for software engineering roles as well as a gallery for personal artwork.

## Tech Stack
* Next.js (App Router) - framework
* TypeScript - language
* Tailwind CSS - styling
* Vercel - hosting/deployment

## Features
Responsive homepage with sections for Code, Artwork, and Photography.
Artwork gallery organized by category, with dedicated pages per piece.
Custom image pipeline (process_images.py) that generates multiple image sizes and blurred placeholders for fast, responsive loading.

## Getting Started
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it locally.


## Project Structure
```
app/               # Pages and routes
lib/               # Shared utilities
types/             # TypeScript types
public/            # Static assets and processed images
artworks.json      # Artwork metadata
process_images.py  # Images resizing/placeholder script
```

## Deployment
Deployed on [Vercel](https://vercel.com). Pushes to main auto-deploy.

## Contact
* Email: hindyhamburger@gmail.com
* LinkedIn: www.linkedin.com/in/hindy-hamburger-1737a63b2
* GitHub: github.com/HindyH
