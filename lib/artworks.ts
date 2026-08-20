import artworksData from "../artworks.json";
import type { GalleryItem } from "@/types/gallery";
import { getGalleryCategories, getGalleryItemsByCategory } from "@/lib/gallery";

export function getArtworks(): GalleryItem[] {
    return artworksData.artworks as GalleryItem[];
}

export function getCategories() {
    return getGalleryCategories(getArtworks());
}

export function getArtworksByCategory(category: string) {
    return getGalleryItemsByCategory(getArtworks(), category);
}