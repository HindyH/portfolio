import { getCategories } from "@/lib/artworks";
import { CategoriesPage } from "@/app/components/gallery/CategoriesPage";

export default function ArtworkCategoriesPage() {
  return <CategoriesPage title="Artwork" basePath="/artwork" categories={getCategories()} />;
}