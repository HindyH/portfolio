import json, re
import sys
import shutil
import subprocess
import tempfile

import io
from PIL import Image, ImageOps, ImageFilter
import colorthief
from pathlib import Path
import base64
import argparse

# Each gallery (art, photo, ...) draws from its own raw folder, output folder,
# metadata file, and JSON manifest - everything else in this script is shared.
GALLERY_TYPES = {
    "art": {
        "raw_dir": Path("raw-art"),
        "output_dir": Path("public/art"),
        "output_json": Path("artworks.json"),
        "json_key": "artworks",
        "metadata_source": Path("metadata.json"),
    },
    "photo": {
        "raw_dir": Path("raw-photos"),
        "output_dir": Path("public/photos"),
        "output_json": Path("photos.json"),
        "json_key": "photos",
        "metadata_source": Path("metadata-photos.json"),
    },
}

# Populated from GALLERY_TYPES[args.type] at the top of main()
RAW_DIR = Path("raw-art")
OUTPUT_DIR = Path("public/art")
OUTPUT_JSON = Path("artworks.json")
OUTPUT_JSON_KEY = "artworks"
METADATA_SOURCE = Path("metadata.json")

SIZES = [400, 800, 1600]
PLACEHOLDER_SIZE = 20
JPEG_QUALITY = 80
VALID_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
VALID_VIDEO_EXTENSIONS = {".mp4", ".mov", ".m4v", ".webm"}
VALID_EXTENSIONS = VALID_IMAGE_EXTENSIONS | VALID_VIDEO_EXTENSIONS
TARGET_ASPECT_RATIO = None  # e.g. 1.0 for square crop; None = leave as-is #<<<<<
VIDEO_CRF = 23  # lower = higher quality/larger file; 18-28 is a sane web range
VIDEO_MAX_WIDTH = 1920  # downscale wider videos to keep file size reasonable


def rename(filename: str):
    name = Path(filename).stem.lower()
    name = re.sub(r"[^a-z0-9]+", "-", name)
    return name.strip("-")


def load_data() -> dict:
    if not METADATA_SOURCE.exists():
        print(f"{METADATA_SOURCE} not found")
        return {}

    with open(METADATA_SOURCE, "r", encoding="utf-8") as f:
        return json.load(f)


def get_data(filename:str, metadata:dict) -> dict:
    entry = metadata.get(filename, {})
    return {
        "title": entry.get("title", Path(filename).stem),
        "year": entry.get("year", None),
        "medium": entry.get("medium", ""),
        "dimensions": entry.get("dimensions", ""),
        "category": entry.get("category", ""),
    }


def open_and_normalize(path) -> Image.Image:
    image = Image.open(path)
    image = ImageOps.exif_transpose(image) # respect phone-camera rotation
    if image.mode != "RGB":
        image = image.convert("RGB")
    return image

def crops(image: Image.Image, target_ratio: float | None) -> Image.Image:
    if target_ratio is None:
        return image

    width, height = image.size
    current_ratio = width / height

    if abs(current_ratio - target_ratio) < 0.01:
        return image # close enough

    if current_ratio > target_ratio:
        # too wide -> crop left/right
        new_width = int(height * target_ratio)
        left = (width - new_width) // 2
        box = (left, 0, left + new_width, height)
    else:
        # too tall -> crop top/bottom
        new_height = int(width / target_ratio)
        top = (height - new_height) // 2
        box = (0, top, width, top + new_height)

    return image.crop(box)


def resizing(image: Image.Image, target_width: int) -> Image.Image:
    width, height = image.size
    if width <= target_width:
        return image.copy()
    ratio = target_width / width
    new_size = (target_width, int(height * ratio))
    return image.resize(new_size, Image.LANCZOS)


def save_jpeg(image: Image.Image, path: Path, quality: int = JPEG_QUALITY) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="JPEG", quality=quality, optimize=True)


def make_placeholder_base64(image: Image.Image) -> str:
    tiny = resizing(image, PLACEHOLDER_SIZE)
    tiny = tiny.filter(ImageFilter.GaussianBlur(radius=2))

    buffer = io.BytesIO()
    tiny.save(buffer, format="JPEG", quality=40)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{encoded}"


def get_dom_color(path:Path) -> str:
    color_thief = colorthief.ColorThief(str(path))
    r, g, b = color_thief.get_color(quality=1)
    return "#{:02x}{:02x}{:02x}".format(r, g, b)


def list_raw_media(only:str | None = None, exclude_slugs: set[str] | None = None) -> list[Path]:
    if not RAW_DIR.exists():
        print(f"ERROR: {RAW_DIR} not found")
        sys.exit(1)

    files = sorted(
        p for p in RAW_DIR.iterdir()
        if p.suffix.lower() in VALID_EXTENSIONS
    )

    if only:
        files = [p for p in files if p.name == only]
        if not files:
            print(f"ERROR: {only} not found in {RAW_DIR}")
            sys.exit(1)

    if exclude_slugs:
        files = [p for p in files if rename(p.name) not in exclude_slugs]

    return files


def probe_video_dimensions(path: Path) -> tuple[int, int]:
    result = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height",
            "-of", "csv=s=x:p=0",
            str(path),
        ],
        capture_output=True, text=True, check=True,
    )
    width_str, height_str = result.stdout.strip().split("x")
    return int(width_str), int(height_str)


def extract_poster_frame(path: Path, out_jpg: Path) -> None:
    # Grab a frame ~10% into the clip (falls back to the first frame for short clips)
    subprocess.run(
        [
            "ffmpeg", "-y", "-ss", "00:00:00.5", "-i", str(path),
            "-frames:v", "1", "-q:v", "2", str(out_jpg),
        ],
        capture_output=True, check=True,
    )


def transcode_video(path: Path, out_mp4: Path) -> None:
    out_mp4.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(path),
            "-vf", f"scale='min({VIDEO_MAX_WIDTH},iw)':-2",
            "-c:v", "libx264", "-crf", str(VIDEO_CRF), "-preset", "medium",
            "-c:a", "aac", "-b:a", "128k",
            "-movflags", "+faststart",  # lets the browser start playback before full download
            str(out_mp4),
        ],
        capture_output=True, check=True,
    )


def process_one_video(path: Path, metadata: dict) -> dict | None:
    filename = path.name
    slug = rename(filename)
    video_out_dir = OUTPUT_DIR / slug

    try:
        width, height = probe_video_dimensions(path)

        with tempfile.TemporaryDirectory() as tmp:
            frame_path = Path(tmp) / "poster.jpg"
            extract_poster_frame(path, frame_path)
            poster = open_and_normalize(frame_path)
            poster = crops(poster, TARGET_ASPECT_RATIO)

            sizes_out = {}
            for w in SIZES:
                resized = resizing(poster, w)
                out_path = video_out_dir / f"{w}.jpg"
                save_jpeg(resized, out_path)
                sizes_out[str(w)] = "/" + str(out_path.relative_to("public"))

            placeholder = make_placeholder_base64(poster)
            dom_color = get_dom_color(frame_path)

        video_out_path = video_out_dir / "video.mp4"
        transcode_video(path, video_out_path)
        video_rel_path = "/" + str(video_out_path.relative_to("public"))

        meta = get_data(filename, metadata)

        entry = {
            "id": slug,
            "title": meta["title"],
            "year": meta["year"],
            "medium": meta["medium"],
            "dimensions": meta["dimensions"],
            "category": meta["category"],
            "original_width": width,
            "original_height": height,
            "sizes": sizes_out,
            "placeholder": placeholder,
            "color": dom_color,
            "type": "video",
            "video": video_rel_path,
        }

        print(f"  OK  {filename} -> {slug} (video)")
        return entry

    except subprocess.CalledProcessError as e:
        stderr = e.stderr.decode("utf-8", errors="ignore") if isinstance(e.stderr, bytes) else e.stderr
        print(f"  ERROR  {filename}: ffmpeg/ffprobe failed: {stderr}")
        return None
    except Exception as e:
        print(f"  ERROR  {filename}: {e}")
        return None


def process_one_image(path: Path, metadata: dict) -> dict | None:
    filename = path.name
    slug = rename(filename)
    image_out_dir = OUTPUT_DIR / slug

    try:
        image = open_and_normalize(path)
        image = crops(image, TARGET_ASPECT_RATIO)

        sizes_out = {}

        for width in SIZES:
            resize_image = resizing(image, width)
            out_path = image_out_dir / f"{width}.jpg"
            save_jpeg(resize_image, out_path)
            sizes_out[str(width)] = "/" + str(out_path.relative_to("public"))

        placeholder = make_placeholder_base64(image)
        dom_color = get_dom_color(path)
        meta = get_data(filename, metadata)

        entry = {
            "id": slug,
            "title": meta["title"],
            "year": meta["year"],
            "medium": meta["medium"],
            "dimensions": meta["dimensions"],
            "category": meta["category"],
            "original_width": image.width,
            "original_height": image.height,
            "sizes": sizes_out,
            "placeholder": placeholder,
            "color": dom_color,
        }

        print(f"  OK  {filename} -> {slug}")
        return entry

    except Exception as e:
        print(f"  ERROR  {filename}: {e}")
        return None


def main():
    global RAW_DIR, OUTPUT_DIR, OUTPUT_JSON, OUTPUT_JSON_KEY, METADATA_SOURCE

    parser = argparse.ArgumentParser(description="Process raw gallery images (art or photos) into site format.")
    parser.add_argument("--type", choices=GALLERY_TYPES.keys(), default="art", help="Which gallery to process")
    parser.add_argument("--only", help="Process a single file from the raw folder", default=None)
    parser.add_argument(
        "--new-only", action="store_true",
        help="Process every raw file that isn't already in the manifest yet, skipping ones already published",
    )
    args = parser.parse_args()

    if args.only and args.new_only:
        print("ERROR: use either --only or --new-only, not both")
        sys.exit(1)

    cfg = GALLERY_TYPES[args.type]
    RAW_DIR = cfg["raw_dir"]
    OUTPUT_DIR = cfg["output_dir"]
    OUTPUT_JSON = cfg["output_json"]
    OUTPUT_JSON_KEY = cfg["json_key"]
    METADATA_SOURCE = cfg["metadata_source"]

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    metadata_dict = load_data()

    existing_items = {}
    if OUTPUT_JSON.exists():
        with open(OUTPUT_JSON, "r", encoding="utf-8") as f:
            existing = json.load(f)
        existing_items = {a["id"]: a for a in existing.get(OUTPUT_JSON_KEY, [])}

    exclude_slugs = set(existing_items.keys()) if args.new_only else None
    files = list_raw_media(only=args.only, exclude_slugs=exclude_slugs)
    print(f"{len(files)} file(s) found in {RAW_DIR}" + (" (new only)" if args.new_only else ""))

    if any(p.suffix.lower() in VALID_VIDEO_EXTENSIONS for p in files) and not (shutil.which("ffmpeg") and shutil.which("ffprobe")):
        print("ERROR: ffmpeg/ffprobe not found on PATH, required to process video files")
        sys.exit(1)

    items = []
    for path in files:
        if path.suffix.lower() in VALID_VIDEO_EXTENSIONS:
            entry = process_one_video(path, metadata_dict)
        else:
            entry = process_one_image(path, metadata_dict)
        if entry is not None:
            items.append(entry)

    if (args.only or args.new_only) and existing_items:
        for entry in items:
            existing_items[entry["id"]] = entry
        items = list(existing_items.values())

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump({OUTPUT_JSON_KEY: items}, f, indent=2)

    print(f"\nDone  {len(items)} item(s) written to {OUTPUT_JSON}")


if __name__ == "__main__":
    main()

# add or fix one later
# add its entry to metadata.json (or metadata-photos.json), drop the file into
# raw-art/ (or raw-photos/), then:
#
# bash
# python process_images.py --type art --only your-filename.jpg
# python process_images.py --type photo --only your-filename.jpg
#
# to (re)process everything in a gallery:
# python process_images.py --type photo