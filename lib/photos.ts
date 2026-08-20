import photosData from "../photos.json";
import type { GalleryItem } from "@/types/gallery";
import { getGalleryCategories, getGalleryItemsByCategory } from "@/lib/gallery";

export function getPhotos(): GalleryItem[] {
    return photosData.photos as GalleryItem[];
}

export function getCategories() {
    return getGalleryCategories(getPhotos());
}

export function getPhotosByCategory(category: string) {
    return getGalleryItemsByCategory(getPhotos(), category);
}