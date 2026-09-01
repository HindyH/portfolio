// Deletes any file on Vercel Blob storage that isn't referenced by a `sizes`
// or `video`/`src` field in artworks.json, photos.json, or videos.json. Use
// this after deleting entries from those JSON files (e.g. curating down a
// category, or removing items) to clean up the now-orphaned files left
// behind on Blob storage.
//
// SAFE BY DEFAULT: running this with no flags only lists what WOULD be
// deleted. Nothing is actually deleted until you pass --confirm.
//
// Usage:
//   BLOB_READ_WRITE_TOKEN=xxx node scripts/prune-unused-blobs.mjs            # dry run
//   BLOB_READ_WRITE_TOKEN=xxx node scripts/prune-unused-blobs.mjs --confirm  # actually delete

import { list, del } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const MANIFESTS = ["artworks.json", "photos.json", "videos.json"];

async function collectReferencedUrls() {
  const urls = new Set();

  for (const file of MANIFESTS) {
    const filePath = path.join(PROJECT_ROOT, file);
    let data;
    try {
      data = JSON.parse(await readFile(filePath, "utf-8"));
    } catch {
      continue; // file might not exist in every checkout; skip quietly
    }
    const items = data.artworks ?? data.photos ?? data.videos ?? [];
    for (const item of items) {
      if (item.sizes) {
        for (const url of Object.values(item.sizes)) {
          if (typeof url === "string" && url.startsWith("http")) urls.add(url);
        }
      }
      if (typeof item.video === "string" && item.video.startsWith("http")) urls.add(item.video);
      if (typeof item.src === "string" && item.src.startsWith("http")) urls.add(item.src); // videos.json entries use `src`
    }
  }

  return urls;
}

async function listAllBlobs() {
  const all = [];
  let cursor;
  do {
    const result = await list({ cursor, limit: 1000 });
    all.push(...result.blobs);
    cursor = result.cursor;
  } while (cursor);
  return all;
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN is not set. Aborting.");
    process.exit(1);
  }

  const confirm = process.argv.includes("--confirm");

  console.log("Reading referenced URLs from artworks.json / photos.json / videos.json...");
  const referenced = await collectReferencedUrls();
  console.log(`  ${referenced.size} URLs currently referenced.`);

  console.log("Listing all files on Blob storage...");
  const blobs = await listAllBlobs();
  console.log(`  ${blobs.length} files currently on Blob storage.`);

  const orphaned = blobs.filter((b) => !referenced.has(b.url));

  if (orphaned.length === 0) {
    console.log("\nNothing to clean up - every file on Blob storage is referenced.");
    return;
  }

  console.log(`\n${orphaned.length} orphaned file(s) found${confirm ? "" : " (DRY RUN - nothing will be deleted)"}:`);
  for (const b of orphaned) {
    console.log(`  ${confirm ? "DELETING" : "would delete"}  ${b.pathname}  (${(b.size / 1024).toFixed(1)} KB)`);
  }

  if (!confirm) {
    console.log("\nRe-run with --confirm to actually delete these files.");
    return;
  }

  for (const b of orphaned) {
    await del(b.url);
  }
  console.log(`\nDeleted ${orphaned.length} file(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});