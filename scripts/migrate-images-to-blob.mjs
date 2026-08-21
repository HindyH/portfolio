// One-time script: uploads public/art and public/photos to Vercel Blob,
// then rewrites artworks.json / photos.json so `sizes` and `placeholder`
// paths point at the new Blob URLs instead of local /public paths.
//
// Usage:
//   BLOB_READ_WRITE_TOKEN=xxx node scripts/migrate-images-to-blob.mjs
//
// Safe to re-run: it skips uploading a file if a blob with the same
// pathname already exists (checked via `put`'s `addRandomSuffix: false`
// + overwrite behavior), but back up your JSON files before the first run.

import { put } from "@vercel/blob";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MANIFESTS = [
  { file: "artworks.json", key: "artworks" },
  { file: "photos.json", key: "photos" },
];

const PROJECT_ROOT = process.cwd();

async function uploadFile(localPublicPath) {
  // localPublicPath looks like "/art/landscape/landscape-800.webp"
  const absPath = path.join(PROJECT_ROOT, "public", localPublicPath);
  const buffer = await readFile(absPath);
  const blobPathname = localPublicPath.replace(/^\//, ""); // "art/landscape/landscape-800.webp"

  const blob = await put(blobPathname, buffer, {
    access: "public",
    addRandomSuffix: false, // keep stable, predictable URLs
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
