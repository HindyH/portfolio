import { notFound } from "next/navigation";
import { getArtworksByCategory, getCategories } from "@/lib/artworks";
import { CategoryGallery } from "./category-gallery";

export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.name }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: rawCategory } = await params;
  const category = decodeURIComponent(rawCategory);
  const artworks = getArtworksByCategory(category);

  if (artworks.length === 0) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-3xl font-semibold capitalize tracking-tight text-neutral-900">
        {category}
      </h1>
      <CategoryGallery artworks={artworks} />
    </main>
  );
}