import artworksData from "../artworks.json";
import photosData from "../photos.json";
import videosData from "../videos.json";
import type { GalleryItem } from "@/types/gallery";
import type { PinnedMedia } from "@/types/media";

function galleryItemToMedia(item: GalleryItem): PinnedMedia {
    return {
        id: item.id,
        type: "image",
        src: item.sizes["800"] ?? item.sizes["1600"] ?? item.sizes["400"],
        title: item.title,
        width: item.original_width,
        height: item.original_height,
    };
}

/** Pulls together artwork, photography, and (if any) video entries into one pool for the corkboard. */
export function getCorkboardMedia(): PinnedMedia[] {
    const images = [
        ...(artworksData.artworks as GalleryItem[]),
        ...(photosData.photos as GalleryItem[]),
    ].map(galleryItemToMedia);

    const videos = (videosData.videos ?? []) as PinnedMedia[];

    return [...images, ...videos];
}