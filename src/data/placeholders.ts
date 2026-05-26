import { ClothingItem } from "../types/closet";
import { getDefaultPlacementForCategory } from "../utils/placement";

const createdAt = "2026-05-25T00:00:00.000Z";

export const PLACEHOLDER_MODEL_URI = "wardrobe-whimsy://placeholder-model";

export const placeholderClothingItems: ClothingItem[] = [
  {
    id: "placeholder-top-tee",
    name: "White Tee",
    category: "top",
    color: "white",
    originalImageDataUrl: "wardrobe-whimsy://placeholder-top-tee",
    cutoutImageDataUrl: "wardrobe-whimsy://placeholder-top-tee",
    ...getDefaultPlacementForCategory("top"),
    createdAt,
    isPlaceholder: true
  },
  {
    id: "placeholder-top-cardigan",
    name: "Soft Cardigan",
    category: "top",
    color: "plum",
    originalImageDataUrl: "wardrobe-whimsy://placeholder-top-cardigan",
    cutoutImageDataUrl: "wardrobe-whimsy://placeholder-top-cardigan",
    ...getDefaultPlacementForCategory("top"),
    createdAt,
    isPlaceholder: true
  },
  {
    id: "placeholder-bottom-jeans",
    name: "Blue Jeans",
    category: "bottom",
    color: "blue",
    originalImageDataUrl: "wardrobe-whimsy://placeholder-bottom-jeans",
    cutoutImageDataUrl: "wardrobe-whimsy://placeholder-bottom-jeans",
    ...getDefaultPlacementForCategory("bottom"),
    createdAt,
    isPlaceholder: true
  },
  {
    id: "placeholder-bottom-skirt",
    name: "Black Skirt",
    category: "bottom",
    color: "black",
    originalImageDataUrl: "wardrobe-whimsy://placeholder-bottom-skirt",
    cutoutImageDataUrl: "wardrobe-whimsy://placeholder-bottom-skirt",
    ...getDefaultPlacementForCategory("bottom"),
    createdAt,
    isPlaceholder: true
  },
  {
    id: "placeholder-shoes-sneakers",
    name: "Clean Sneakers",
    category: "shoes",
    color: "white",
    originalImageDataUrl: "wardrobe-whimsy://placeholder-shoes-sneakers",
    cutoutImageDataUrl: "wardrobe-whimsy://placeholder-shoes-sneakers",
    ...getDefaultPlacementForCategory("shoes"),
    createdAt,
    isPlaceholder: true
  },
  {
    id: "placeholder-shoes-flats",
    name: "Simple Flats",
    category: "shoes",
    color: "green",
    originalImageDataUrl: "wardrobe-whimsy://placeholder-shoes-flats",
    cutoutImageDataUrl: "wardrobe-whimsy://placeholder-shoes-flats",
    ...getDefaultPlacementForCategory("shoes"),
    createdAt,
    isPlaceholder: true
  },
  {
    id: "placeholder-jacket-blazer",
    name: "Velvet Blazer",
    category: "jacket",
    color: "violet",
    originalImageDataUrl: "wardrobe-whimsy://placeholder-jacket-blazer",
    cutoutImageDataUrl: "wardrobe-whimsy://placeholder-jacket-blazer",
    ...getDefaultPlacementForCategory("jacket"),
    createdAt,
    isPlaceholder: true
  },
  {
    id: "placeholder-dress-slip",
    name: "Moon Slip Dress",
    category: "dress",
    color: "gold",
    originalImageDataUrl: "wardrobe-whimsy://placeholder-dress-slip",
    cutoutImageDataUrl: "wardrobe-whimsy://placeholder-dress-slip",
    ...getDefaultPlacementForCategory("dress"),
    createdAt,
    isPlaceholder: true
  }
];
