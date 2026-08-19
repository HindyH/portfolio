import artworksData from "../artworks.json"
import type { Artwork } from "@/types/artwork";

export function getCategories() {
    const artworks = getArtworks();
    const names = Array.from(new Set(artworks.map((a) => a.category)));
    return names.map((name) => ({
        name,
        cover: artworks.find((a) => a.category === name)!,
        count: artworks.filter((a) => a.category === name).length,
    }));
}

export function getArtworksByCategory(category: string) {
    return getArtworks().filter((a) => a.category === category);
}

export function getArtworks(): Artwork[] {
    return artworksData.artworks as Artwork[];
}