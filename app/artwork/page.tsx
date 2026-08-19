import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/artworks";

export default function ArtworkCategoriesPage() {
  const categories = getCategories();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-neutral-900">Artwork</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link key={cat.name} href={`/artwork/${encodeURIComponent(cat.name)}`} className="group block">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-neutral-100">
              <Image
                src={cat.cover.sizes["800"]}
                alt={cat.name}
                fill
                placeholder="blur"
                blurDataURL={cat.cover.placeholder}
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-lg font-medium capitalize text-neutral-900">{cat.name}</span>
              <span className="text-sm text-neutral-500">{cat.count}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}