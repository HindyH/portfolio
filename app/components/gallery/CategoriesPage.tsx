import Link from "next/link";
import Image from "next/image";
import type { GalleryCategory } from "@/types/gallery";

export function CategoriesPage({
  title,
  basePath,
  categories,
}: {
  title: string;
  basePath: string;
  categories: GalleryCategory[];
}) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-neutral-900">{title}</h1>
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link key={cat.name} href={`${basePath}/${encodeURIComponent(cat.name)}`} className="group block">
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