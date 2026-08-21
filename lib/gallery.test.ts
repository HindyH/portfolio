import { describe, it, expect } from "vitest";
import { getGalleryCategories, getGalleryItemsByCategory } from "@/lib/gallery";
import type { GalleryItem } from "@/types/gallery";

function makeItem(overrides: Partial<GalleryItem>): GalleryItem {
  return {
    id: "1",
    title: "Untitled",
    year: 2024,
    medium: "oil",
    dimensions: "10x10",
    original_width: 100,
    original_height: 100,
    sizes: {},
    placeholder: "",
    color: "#000000",
    category: "misc",
    ...overrides,
  };
}

describe("getGalleryCategories", () => {
  it("groups items by category and counts them", () => {
    const items = [
      makeItem({ id: "1", category: "landscape" }),
      makeItem({ id: "2", category: "landscape" }),
      makeItem({ id: "3", category: "portrait" }),
    ];

    const categories = getGalleryCategories(items);

    expect(categories).toHaveLength(2);
    const landscape = categories.find((c) => c.name === "landscape");
    expect(landscape?.count).toBe(2);
    expect(landscape?.cover.id).toBe("1"); // first item in that category
  });

  it("returns an empty array for no items", () => {
    expect(getGalleryCategories([])).toEqual([]);
  });
});

describe("getGalleryItemsByCategory", () => {
  it("filters items to the requested category only", () => {
    const items = [
      makeItem({ id: "1", category: "landscape" }),
      makeItem({ id: "2", category: "portrait" }),
    ];

    const result = getGalleryItemsByCategory(items, "portrait");

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("returns an empty array when the category has no matches", () => {
    const items = [makeItem({ id: "1", category: "landscape" })];
    expect(getGalleryItemsByCategory(items, "nonexistent")).toEqual([]);
  });
});
