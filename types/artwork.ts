export interface Artwork {
    id: string;
    title: string;
    year: number | null;
    medium: string;
    dimensions: string;
    original_width: number;
    original_height: number;
    sizes: Record<string, string>; // "400" | "800" | "1600" -> path
    placeholder: string; // base64 data URL
    color: string; //hex
    category: string;
}