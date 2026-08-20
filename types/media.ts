export interface PinnedMedia {
    id: string;
    type: "image" | "video";
    src: string; // path under /public
    title: string;
    width: number;
    height: number;
}