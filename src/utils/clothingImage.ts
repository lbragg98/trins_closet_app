import { ClothingItem } from "../types/closet";

export function getDisplayCutoutUri(item?: ClothingItem) {
  if (!item) return undefined;

  const legacyItem = item as ClothingItem & { imageUri?: string; imageUrl?: string; image?: string };
  return (
    item.transformedCutoutDataUrl ??
    item.cutoutImageDataUrl ??
    item.originalImageDataUrl ??
    legacyItem.imageUrl ??
    legacyItem.imageUri ??
    legacyItem.image
  );
}
