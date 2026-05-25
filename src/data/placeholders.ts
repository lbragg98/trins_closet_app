import { ClothingItem } from "../types/closet";
import { getDefaultPlacementForCategory } from "../utils/placement";

const createdAt = "2026-05-25T00:00:00.000Z";

export const PLACEHOLDER_MODEL_URI = "perfect-closet://placeholder-model";

export const placeholderClothingItems: ClothingItem[] = [
  {
    id: "placeholder-top-tee",
    name: "White Tee",
    category: "top",
    color: "white",
    originalImageDataUrl: "perfect-closet://placeholder-top-tee",
    cutoutImageDataUrl: "perfect-closet://placeholder-top-tee",
    ...getDefaultPlacementForCategory("top"),
    createdAt,
    isPlaceholder: true
  },
  {
    id: "placeholder-top-cardigan",
    name: "Soft Cardigan",
    category: "top",
    color: "plum",
    originalImageDataUrl: "perfect-closet://placeholder-top-cardigan",
    cutoutImageDataUrl: "perfect-closet://placeholder-top-cardigan",
    ...getDefaultPlacementForCategory("top"),
    createdAt,
    isPlaceholder: true
  },
  {
    id: "placeholder-bottom-jeans",
    name: "Blue Jeans",
    category: "bottom",
    color: "blue",
    originalImageDataUrl: "perfect-closet://placeholder-bottom-jeans",
    cutoutImageDataUrl: "perfect-closet://placeholder-bottom-jeans",
    ...getDefaultPlacementForCategory("bottom"),
    createdAt,
    isPlaceholder: true
  },
  {
    id: "placeholder-bottom-skirt",
    name: "Black Skirt",
    category: "bottom",
    color: "black",
    originalImageDataUrl: "perfect-closet://placeholder-bottom-skirt",
    cutoutImageDataUrl: "perfect-closet://placeholder-bottom-skirt",
    ...getDefaultPlacementForCategory("bottom"),
    createdAt,
    isPlaceholder: true
  },
  {
    id: "placeholder-shoes-sneakers",
    name: "Clean Sneakers",
    category: "shoes",
    color: "white",
    originalImageDataUrl: "perfect-closet://placeholder-shoes-sneakers",
    cutoutImageDataUrl: "perfect-closet://placeholder-shoes-sneakers",
    ...getDefaultPlacementForCategory("shoes"),
    createdAt,
    isPlaceholder: true
  },
  {
    id: "placeholder-shoes-flats",
    name: "Simple Flats",
    category: "shoes",
    color: "green",
    originalImageDataUrl: "perfect-closet://placeholder-shoes-flats",
    cutoutImageDataUrl: "perfect-closet://placeholder-shoes-flats",
    ...getDefaultPlacementForCategory("shoes"),
    createdAt,
    isPlaceholder: true
  },
  {
    id: "placeholder-jacket-blazer",
    name: "Velvet Blazer",
    category: "jacket",
    color: "violet",
    originalImageDataUrl: "perfect-closet://placeholder-jacket-blazer",
    cutoutImageDataUrl: "perfect-closet://placeholder-jacket-blazer",
    ...getDefaultPlacementForCategory("jacket"),
    createdAt,
    isPlaceholder: true
  },
  {
    id: "placeholder-dress-slip",
    name: "Moon Slip Dress",
    category: "dress",
    color: "gold",
    originalImageDataUrl: "perfect-closet://placeholder-dress-slip",
    cutoutImageDataUrl: "perfect-closet://placeholder-dress-slip",
    ...getDefaultPlacementForCategory("dress"),
    createdAt,
    isPlaceholder: true
  },
  {
    id: "placeholder-accessory-cap",
    name: "Cream Cap",
    category: "accessory",
    color: "cream",
    originalImageDataUrl: "perfect-closet://placeholder-accessory-cap",
    cutoutImageDataUrl: "perfect-closet://placeholder-accessory-cap",
    ...getDefaultPlacementForCategory("accessory"),
    createdAt,
    isPlaceholder: true
  },
  {
    id: "placeholder-accessory-scarf",
    name: "Silk Scarf",
    category: "accessory",
    color: "rose",
    originalImageDataUrl: "perfect-closet://placeholder-accessory-scarf",
    cutoutImageDataUrl: "perfect-closet://placeholder-accessory-scarf",
    ...getDefaultPlacementForCategory("accessory"),
    createdAt,
    isPlaceholder: true
  }
];
