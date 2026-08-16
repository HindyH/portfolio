import artworksData from "../artworks.json"
import type { Artwork } from "@/types/artwork";

export function getArtworks(): Artwork[] {
    return artworksData.artworks as Artwork[];
}