import { ClothingCategory } from "../types/closet";

export const categoryLabels: Record<ClothingCategory, string> = {
  tops: "Tops",
  bottoms: "Bottoms",
  shoes: "Shoes",
  jacket: "Jackets",
  dress: "Dresses"
};

export const categories: ClothingCategory[] = ["tops", "bottoms", "shoes", "dress", "jacket"];

export const normalizeCategory = (category: string): ClothingCategory | undefined => {
  if (category === "top") return "tops";
  if (category === "bottom") return "bottoms";
  if (
    category === "tops" ||
    category === "bottoms" ||
    category === "shoes" ||
    category === "dress" ||
    category === "jacket"
  ) {
    return category;
  }

  return undefined;
};
