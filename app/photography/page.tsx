import { getCategories } from "@/lib/photos";
import { CategoriesPage } from "@/app/components/gallery/CategoriesPage";

export default function PhotographyCategoriesPage() {
  return <CategoriesPage title="Photography" basePath="/photography" categories={getCategories()} />;
}