import { ClothingCategory } from "../types/closet";
import { ClothingPlacement } from "../types/closet";
import { MODEL_DIMENSIONS, ModelAnchors, MODEL_ANCHORS } from "../config/modelAnchors";

export type DefaultPlacement = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  layerOrder: number;
};

export type ImageDimensions = {
  width: number;
  height: number;
};

export type PlacementFrame = {
  width: number;
  height: number;
};

export const layerOrderByCategory: Record<ClothingCategory, number> = {
  bottom: 20,
  top: 30,
  dress: 35,
  jacket: 40,
  shoes: 50,
  accessory: 60
};

export const placementFramesByCategory: Record<ClothingCategory, PlacementFrame> = {
  accessory: { width: 38, height: 20 },
  jacket: { width: 50, height: 34 },
  top: { width: 44, height: 30 },
  dress: { width: 48, height: 58 },
  bottom: { width: 42, height: 36 },
  shoes: { width: 34, height: 13 }
};

const DEFAULT_IMAGE_DIMENSIONS: ImageDimensions = {
  width: 500,
  height: 500
};

const toPercentX = (value: number) => (value / MODEL_DIMENSIONS.width) * 100;
const toPercentY = (value: number) => (value / MODEL_DIMENSIONS.height) * 100;

const frameWidthInModelPixels = (category: ClothingCategory) =>
  (placementFramesByCategory[category].width / 100) * MODEL_DIMENSIONS.width;

const imageScale = (category: ClothingCategory, targetModelWidth: number, imageDimensions: ImageDimensions) => {
  const baseScale = targetModelWidth / frameWidthInModelPixels(category);
  const aspect = imageDimensions.width / Math.max(imageDimensions.height, 1);
  const aspectAdjustment = aspect < 0.55 ? 0.9 : aspect > 1.45 ? 1.08 : 1;
  return Number((baseScale * aspectAdjustment).toFixed(2));
};

const placementFromCenter = (
  category: ClothingCategory,
  centerX: number,
  topY: number,
  scale: number,
  layerOrder: number
): DefaultPlacement => {
  const frame = placementFramesByCategory[category];
  const widthPercent = frame.width * scale;

  return {
    x: Number((toPercentX(centerX) - widthPercent / 2).toFixed(2)),
    y: Number(toPercentY(topY).toFixed(2)),
    scale,
    rotation: 0,
    layerOrder
  };
};

export function legacyPlacementToNormalized(category: ClothingCategory, placement: DefaultPlacement): ClothingPlacement {
  const frame = placementFramesByCategory[category];
  return {
    xPercent: Number((placement.x + (frame.width * placement.scale) / 2).toFixed(2)),
    yPercent: Number((placement.y + (frame.height * placement.scale) / 2).toFixed(2)),
    scale: placement.scale,
    rotation: placement.rotation,
    layerOrder: placement.layerOrder
  };
}

export function normalizedPlacementToLegacy(category: ClothingCategory, placement: ClothingPlacement): DefaultPlacement {
  const frame = placementFramesByCategory[category];
  return {
    x: Number((placement.xPercent - (frame.width * placement.scale) / 2).toFixed(2)),
    y: Number((placement.yPercent - (frame.height * placement.scale) / 2).toFixed(2)),
    scale: placement.scale,
    rotation: placement.rotation,
    layerOrder: placement.layerOrder
  };
}

export function calculateTopPlacement(
  modelAnchors: ModelAnchors = MODEL_ANCHORS,
  imageDimensions: ImageDimensions = DEFAULT_IMAGE_DIMENSIONS
) {
  const shoulderWidth = modelAnchors.rightShoulder.x - modelAnchors.leftShoulder.x;
  const scale = imageScale("top", shoulderWidth * 1.7, imageDimensions);
  return placementFromCenter("top", modelAnchors.chest.x, modelAnchors.leftShoulder.y - 8, scale, layerOrderByCategory.top);
}

export function calculateBottomPlacement(
  modelAnchors: ModelAnchors = MODEL_ANCHORS,
  imageDimensions: ImageDimensions = DEFAULT_IMAGE_DIMENSIONS
) {
  const hipWidth = modelAnchors.rightHip.x - modelAnchors.leftHip.x;
  const scale = imageScale("bottom", hipWidth * 1.75, imageDimensions);
  return placementFromCenter("bottom", modelAnchors.waist.x, modelAnchors.waist.y - 8, scale, layerOrderByCategory.bottom);
}

export function calculateDressPlacement(
  modelAnchors: ModelAnchors = MODEL_ANCHORS,
  imageDimensions: ImageDimensions = DEFAULT_IMAGE_DIMENSIONS
) {
  const shoulderWidth = modelAnchors.rightShoulder.x - modelAnchors.leftShoulder.x;
  const hipWidth = modelAnchors.rightHip.x - modelAnchors.leftHip.x;
  const scale = imageScale("dress", Math.max(shoulderWidth * 1.65, hipWidth * 1.9), imageDimensions);
  return placementFromCenter("dress", modelAnchors.chest.x, modelAnchors.leftShoulder.y - 8, scale, layerOrderByCategory.dress);
}

export function calculateShoesPlacement(
  modelAnchors: ModelAnchors = MODEL_ANCHORS,
  imageDimensions: ImageDimensions = DEFAULT_IMAGE_DIMENSIONS
) {
  const footDistance = modelAnchors.rightFoot.x - modelAnchors.leftFoot.x;
  const scale = imageScale("shoes", footDistance * 2.2, imageDimensions);
  return placementFromCenter("shoes", modelAnchors.waist.x, modelAnchors.leftFoot.y - 24, scale, layerOrderByCategory.shoes);
}

export function calculateJacketPlacement(
  modelAnchors: ModelAnchors = MODEL_ANCHORS,
  imageDimensions: ImageDimensions = DEFAULT_IMAGE_DIMENSIONS
) {
  const shoulderWidth = modelAnchors.rightShoulder.x - modelAnchors.leftShoulder.x;
  const scale = imageScale("jacket", shoulderWidth * 1.95, imageDimensions);
  return placementFromCenter(
    "jacket",
    modelAnchors.chest.x,
    modelAnchors.leftShoulder.y - 18,
    scale,
    layerOrderByCategory.jacket
  );
}

export function calculateAccessoryPlacement() {
  return placementFromCenter("accessory", MODEL_ANCHORS.neck.x, MODEL_ANCHORS.neck.y - 66, 1, layerOrderByCategory.accessory);
}

export function getDefaultPlacementForCategory(
  category: ClothingCategory,
  modelAnchors: ModelAnchors = MODEL_ANCHORS,
  imageDimensions: ImageDimensions = DEFAULT_IMAGE_DIMENSIONS
) {
  if (category === "top") return calculateTopPlacement(modelAnchors, imageDimensions);
  if (category === "bottom") return calculateBottomPlacement(modelAnchors, imageDimensions);
  if (category === "dress") return calculateDressPlacement(modelAnchors, imageDimensions);
  if (category === "shoes") return calculateShoesPlacement(modelAnchors, imageDimensions);
  if (category === "jacket") return calculateJacketPlacement(modelAnchors, imageDimensions);
  return calculateAccessoryPlacement();
}

export function getSuggestedPlacementForCategory(category: ClothingCategory): ClothingPlacement {
  const suggestions: Record<ClothingCategory, ClothingPlacement> = {
    top: { xPercent: 50, yPercent: 38, scale: 1, rotation: 0, layerOrder: layerOrderByCategory.top },
    bottom: { xPercent: 50, yPercent: 58, scale: 1, rotation: 0, layerOrder: layerOrderByCategory.bottom },
    shoes: { xPercent: 50, yPercent: 85, scale: 0.8, rotation: 0, layerOrder: layerOrderByCategory.shoes },
    jacket: { xPercent: 50, yPercent: 38, scale: 1.1, rotation: 0, layerOrder: layerOrderByCategory.jacket },
    dress: { xPercent: 50, yPercent: 50, scale: 1.15, rotation: 0, layerOrder: layerOrderByCategory.dress },
    accessory: { xPercent: 50, yPercent: 22, scale: 0.6, rotation: 0, layerOrder: layerOrderByCategory.accessory }
  };

  return suggestions[category];
}

export const defaultPlacementByCategory: Record<ClothingCategory, DefaultPlacement> = {
  accessory: getDefaultPlacementForCategory("accessory"),
  jacket: getDefaultPlacementForCategory("jacket"),
  top: getDefaultPlacementForCategory("top"),
  dress: getDefaultPlacementForCategory("dress"),
  bottom: getDefaultPlacementForCategory("bottom"),
  shoes: getDefaultPlacementForCategory("shoes")
};
