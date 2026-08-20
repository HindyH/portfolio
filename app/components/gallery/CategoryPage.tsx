import type { GalleryItem } from "@/types/gallery";
import { GalleryGrid } from "./GalleryGrid";

export function CategoryPage({ category, items }: { category: string; items: GalleryItem[] }) {
  return (
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="mb-8 text-3xl font-semibold capitalize tracking-tight text-neutral-900">
              {category}
          </h1>
          <GalleryGrid items={items}/>
      </main>
  );
}