"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Artwork } from "@/types/artwork";

export function CategoryGallery({ artworks }: { artworks: Artwork[] }) {
  const [selected, setSelected] = useState<Artwork | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {artworks.map((art) => (
          <ArtworkCard key={art.id} art={art} onClick={() => setSelected(art)} />
        ))}
      </div>
      {selected && <Lightbox art={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function ArtworkCard({ art, onClick }: { art: Artwork; onClick: () => void }) {
  const aspectRatio = art.original_width / art.original_height;
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative w-full overflow-hidden rounded-md bg-neutral-100" style={{ aspectRatio }}>
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
          {art.medium}{art.year ? `, ${art.year}` : ""}
        </p>
      </div>
    </div>
  );
}

function Lightbox({ art, onClose }: { art: Artwork; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <button className="absolute right-4 top-4 text-2xl text-white/80 hover:text-white" onClick={onClose} aria-label="Close">✕</button>
      <div className="relative max-h-[85vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative mx-auto max-h-[75vh] w-full" style={{ aspectRatio: art.original_width / art.original_height }}>
          <Image
            src={art.sizes["1600"] ?? art.sizes["800"]}
            alt={art.title}
            fill
            placeholder="blur"
            blurDataURL={art.placeholder}
            className="object-contain"
            sizes="90vw"
          />
        </div>
        <div className="mt-4 text-center text-white">
          <p className="text-lg font-medium">{art.title}</p>
          <p className="text-sm text-white/70">{art.medium}{art.year ? `, ${art.year}` : ""}</p>
        </div>
      </div>
    </div>
  );
}