// Uploads any not-yet-migrated files in public/art and public/photos (images
// and videos) to Vercel Blob, then rewrites artworks.json / photos.json so
// `sizes` and `video` paths point at the new Blob URLs instead of local
// /public paths. Originally a one-time migration script; now also the
// normal way to publish newly-added or updated artwork/photos/videos after
// running process_images.py.
//
// Usage:
//   BLOB_READ_WRITE_TOKEN=xxx node scripts/migrate-images-to-blob.mjs
//
// Safe to re-run: any entry whose sizes/video already start with "http" is
// skipped, so only newly-processed local files get uploaded. Back up your
// JSON files before the first run.

import { put } from "@vercel/blob";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const MANIFESTS = [
  { file: "artworks.json", key: "artworks" },
  { file: "photos.json", key: "photos" },
];

const PROJECT_ROOT = process.cwd();

async function uploadFile(localPublicPath) {
  // localPublicPath looks like "/art/landscape/landscape-800.webp"
  const absPath = path.join(PROJECT_ROOT, "public", localPublicPath);
  const buffer = await readFile(absPath);

  // Content-hash the pathname so replacing a file's contents (same filename,
  // better version) always produces a brand-new URL. This is required, not
  // optional: Next.js's Image Optimization service caches a resized copy of
  // every image keyed by its URL, with NO way to manually invalidate that
  // cache (per Next's own docs). Reusing the same URL for changed content
  // means visitors can keep seeing the old resized version for hours,
  // regardless of what the raw file on Blob storage says.
  const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 10);
  const ext = path.extname(localPublicPath); // ".jpg", ".mp4", etc.
  const base = localPublicPath.replace(/^\//, "").slice(0, -ext.length || undefined);
  const blobPathname = `${base}.${hash}${ext}`;

  const blob = await put(blobPathname, buffer, {
    access: "public",
    addRandomSuffix: false, // hash already makes the path unique per content
    allowOverwrite: true, // harmless no-op if this exact content was already uploaded
  });

  return blob.url;
}

async function migrateManifest({ file, key }) {
  const manifestPath = path.join(PROJECT_ROOT, file);
  const raw = await readFile(manifestPath, "utf-8");
  const data = JSON.parse(raw);
  const items = data[key];

  console.log(`\nMigrating ${items.length} items from ${file}...`);

  for (const item of items) {
    const newSizes = {};
    for (const [sizeKey, localPath] of Object.entries(item.sizes)) {
      if (localPath.startsWith("http")) {
        newSizes[sizeKey] = localPath; // already migrated
        continue;
      }
      const url = await uploadFile(localPath);
      newSizes[sizeKey] = url;
      console.log(`  uploaded ${localPath} -> ${url}`);
    }
    item.sizes = newSizes;
    // placeholder is a base64 data URL already inlined in JSON, not a file —
    // leave it as-is, it doesn't need hosting.

    // video entries also carry a `video` field pointing at the mp4 file
    if (item.video && !item.video.startsWith("http")) {
      const url = await uploadFile(item.video);
      console.log(`  uploaded ${item.video} -> ${url}`);
      item.video = url;
    }
  }

  await writeFile(manifestPath, JSON.stringify(data, null, 2) + "\n");
  console.log(`Updated ${file}`);
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN is not set. Aborting.");
    process.exit(1);
  }

  for (const manifest of MANIFESTS) {
    await migrateManifest(manifest);
  }

  console.log(
    "\nDone. Verify the site locally (npm run dev), then remove the " +
      "migrated files from public/art and public/photos and commit."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});