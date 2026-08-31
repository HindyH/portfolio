"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { GalleryItem } from "@/types/gallery";

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <>
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
        {items.map((item) => (
          <GalleryCard key={item.id} item={item} onClick={() => setSelected(item)} />
        ))}
      </div>
      {selected && <Lightbox item={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function GalleryCard({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
  const aspectRatio = item.original_width / item.original_height;
  const isVideo = item.type === "video";
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative w-full overflow-hidden rounded-md bg-neutral-100" style={{ aspectRatio }}>
        <Image
          src={item.sizes["800"]}
          alt={item.title}
          fill
          placeholder="blur"
          blurDataURL={item.placeholder}
          sizes="(max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white transition-transform group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-5 w-5"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className="text-sm font-medium text-neutral-900">{item.title}</p>
        <p className="text-xs text-neutral-500">
          {[item.medium, item.year].filter(Boolean).join(", ")}
        </p>
      </div>
    </div>
  );
}

function Lightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const isVideo = item.type === "video";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <button className="absolute right-4 top-4 text-2xl text-white/80 hover:text-white" onClick={onClose} aria-label="Close">✕</button>
      <div className="relative max-h-[85vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative mx-auto max-h-[75vh] w-full" style={{ aspectRatio: item.original_width / item.original_height }}>
          {isVideo && item.video ? (
            <video
              src={item.video}
              poster={item.sizes["1600"] ?? item.sizes["800"]}
              controls
              autoPlay
              playsInline
              className="h-full w-full object-contain"
            />
          ) : (
            <Image
              src={item.sizes["1600"] ?? item.sizes["800"]}
              alt={item.title}
              fill
              placeholder="blur"
              blurDataURL={item.placeholder}
              className="object-contain"
              sizes="90vw"
            />
          )}
        </div>
        <div className="mt-4 text-center text-white">
          <p className="text-lg font-medium">{item.title}</p>
          <p className="text-sm text-white/70">{[item.medium, item.year].filter(Boolean).join(", ")}</p>
        </div>
      </div>
    </div>
  );
}