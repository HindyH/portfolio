import type { GalleryCategory, GalleryItem } from "@/types/gallery";

function byTitle(a: GalleryItem, b: GalleryItem): number {
    return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
}

export function getGalleryCategories(items: GalleryItem[]): GalleryCategory[] {
    const names = Array.from(new Set(items.map((item) => item.category))).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
    );
    return names.map((name) => {
        const itemsInCategory = items.filter((item) => item.category === name).sort(byTitle);
        return {
            name,
            cover: itemsInCategory[0],
            count: itemsInCategory.length,
        };
    });
}

export function getGalleryItemsByCategory(items: GalleryItem[], category: string): GalleryItem[] {
    return items.filter((item) => item.category === category).sort(byTitle);
}