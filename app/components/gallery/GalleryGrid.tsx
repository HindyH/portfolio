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
      </div>
      <div className="mt-2">
        <p className="text-sm font-medium text-neutral-900">{item.title}</p>
        <p className="text-xs text-neutral-500">
          {item.medium}{item.year ? `, ${item.year}` : ""}
        </p>
      </div>
    </div>
  );
}

function Lightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <button className="absolute right-4 top-4 text-2xl text-white/80 hover:text-white" onClick={onClose} aria-label="Close">✕</button>
      <div className="relative max-h-[85vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative mx-auto max-h-[75vh] w-full" style={{ aspectRatio: item.original_width / item.original_height }}>
          <Image
            src={item.sizes["1600"] ?? item.sizes["800"]}
            alt={item.title}
            fill
            placeholder="blur"
            blurDataURL={item.placeholder}
            className="object-contain"
            sizes="90vw"
          />
        </div>
        <div className="mt-4 text-center text-white">
          <p className="text-lg font-medium">{item.title}</p>
          <p className="text-sm text-white/70">{item.medium}{item.year ? `, ${item.year}` : ""}</p>
        </div>
      </div>
    </div>
  );
}