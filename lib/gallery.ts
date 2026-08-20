import type { GalleryCategory, GalleryItem } from "@/types/gallery";

/** Group a flat list of gallery items into categories, using the first item of each as the cover. */
export function getGalleryCategories(items: GalleryItem[]): GalleryCategory[] {
    const names = Array.from(new Set(items.map((item) => item.category)));
    return names.map((name) => ({
        name,
        cover: items.find((item) => item.category === name)!,
        count: items.filter((item) => item.category === name).length,
    }));
}

export function getGalleryItemsByCategory(items: GalleryItem[], category: string): GalleryItem[] {
    return items.filter((item) => item.category === category);
}