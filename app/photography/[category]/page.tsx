import { notFound } from "next/navigation";
import { getPhotosByCategory, getCategories } from "@/lib/photos";
import { CategoryPage } from "@/app/components/gallery/CategoryPage";

export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.name }));
}

export default async function PhotographyCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: rawCategory } = await params;
  const category = decodeURIComponent(rawCategory);
  const photos = getPhotosByCategory(category);

  if (photos.length === 0) notFound();

  return <CategoryPage category={category} items={photos} />;
}