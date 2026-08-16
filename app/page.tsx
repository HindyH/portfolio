import Image from "next/image";
import { getArtworks } from "@/lib/artworks";
import type { Artwork } from "@/types/artwork";

export default function GalleryPage() {
  const artworks = getArtworks();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-neutral-900">
        Gallery
      </h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {artworks.map((art) => (
            <ArtworkCard key={art.id} art={art}/>
        ))}
      </div>
    </main>
  );
}

function ArtworkCard({ art }: { art: Artwork }) {
  const aspectRatio = art.original_width / art.original_height;

  return (
    <div className="group cursor-pointer">
      <div
          className="relative w-full overflow-hidden rounded-md bg-neutral-100"
          style={{aspectRatio}}
      >
        <Image
            src={art.sizes["800"]}
            alt={art.title}
            fill
            placeholder="blur"
            blurDataURL={art.placeholder}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-2">
        <p className="text-sm font-medium text-neutral-900">{art.title}</p>
        <p className="text-xs text-neutral-500">
          {art.medium}
          {art.year ? `, ${art.year}` : ""}
        </p>
      </div>
    </div>
  );
}
