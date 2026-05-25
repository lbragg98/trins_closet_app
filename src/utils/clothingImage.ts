import { ClothingItem } from "../types/closet";

export function getDisplayCutoutUri(item: ClothingItem) {
  return item.transformedCutoutDataUrl ?? item.cutoutImageDataUrl;
}
