export type ClothingCategory = "tops" | "bottoms" | "shoes" | "dress" | "jacket";

export type ClothingPlacement = {
  xPercent: number;
  yPercent: number;
  scale: number;
  rotation: number;
  layerOrder: number;
};

export type ClothingTransform = {
  mode: "none" | "basic" | "warp";
  corners?: {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
  };
  scaleX?: number;
  scaleY?: number;
  skewX?: number;
  skewY?: number;
  rotation?: number;
};

export type ClothingItem = {
  id: string;
  name: string;
  category: ClothingCategory;
  color?: string;
  originalImageBlob?: Blob;
  cutoutImageBlob?: Blob;
  transformedCutoutBlob?: Blob;
  originalImageDataUrl: string;
  cutoutImageDataUrl: string;
  transformedCutoutDataUrl?: string;
  thumbnailDataUrl?: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  layerOrder: number;
  placement?: ClothingPlacement;
  transform?: ClothingTransform;
  createdAt: string;
  updatedAt?: string;
};

export type Outfit = {
  id: string;
  name: string;
  selectedItemIds: Partial<Record<ClothingCategory, string[]>>;
  previewImageDataUrl?: string;
  createdAt: string;
};

export type SavedModel = {
  id: string;
  name: string;
  imageBlob?: Blob;
  imageUrl?: string;
  imageDataUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SelectedCategoryKey =
  | "tops"
  | "bottoms"
  | "shoes"
  | "dress"
  | "jacket";
