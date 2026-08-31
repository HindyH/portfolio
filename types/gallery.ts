export interface GalleryItem {
    id: string;
    title: string;
    year: number | null;
    medium: string;
    dimensions: string;
    original_width: number;
    original_height: number;
    sizes: Record<string, string>; // "400" | "800" | "1600" -> path (poster frame for videos)
    placeholder: string; // base64 data URL
    color: string; // hex
    category: string;
    type?: "image" | "video"; // defaults to "image" when absent
    video?: string; // path/URL to the video file, present when type === "video"
}

export interface GalleryCategory {
    name: string;
    cover: GalleryItem;
    count: number;
}