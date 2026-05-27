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
  bottoms: 20,
  tops: 30,
  dress: 35,
  jacket: 40,
  shoes: 50
};

export const placementFramesByCategory: Record<ClothingCategory, PlacementFrame> = {
  jacket: { width: 50, height: 34 },
  tops: { width: 44, height: 30 },
  dress: { width: 48, height: 58 },
  bottoms: { width: 42, height: 36 },
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
  const scale = imageScale("tops", shoulderWidth * 1.7, imageDimensions);
  return placementFromCenter("tops", modelAnchors.chest.x, modelAnchors.leftShoulder.y - 8, scale, layerOrderByCategory.tops);
}

export function calculateBottomPlacement(
  modelAnchors: ModelAnchors = MODEL_ANCHORS,
  imageDimensions: ImageDimensions = DEFAULT_IMAGE_DIMENSIONS
) {
  const hipWidth = modelAnchors.rightHip.x - modelAnchors.leftHip.x;
  const scale = imageScale("bottoms", hipWidth * 1.75, imageDimensions);
  return placementFromCenter("bottoms", modelAnchors.waist.x, modelAnchors.waist.y - 8, scale, layerOrderByCategory.bottoms);
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

export function getDefaultPlacementForCategory(
  category: ClothingCategory,
  modelAnchors: ModelAnchors = MODEL_ANCHORS,
  imageDimensions: ImageDimensions = DEFAULT_IMAGE_DIMENSIONS
) {
  if (category === "tops") return calculateTopPlacement(modelAnchors, imageDimensions);
  if (category === "bottoms") return calculateBottomPlacement(modelAnchors, imageDimensions);
  if (category === "dress") return calculateDressPlacement(modelAnchors, imageDimensions);
  if (category === "shoes") return calculateShoesPlacement(modelAnchors, imageDimensions);
  return calculateJacketPlacement(modelAnchors, imageDimensions);
}

export function getSuggestedPlacementForCategory(category: ClothingCategory): ClothingPlacement {
  const suggestions: Record<ClothingCategory, ClothingPlacement> = {
    tops: { xPercent: 50, yPercent: 38, scale: 1, rotation: 0, layerOrder: layerOrderByCategory.tops },
    bottoms: { xPercent: 50, yPercent: 58, scale: 1, rotation: 0, layerOrder: layerOrderByCategory.bottoms },
    shoes: { xPercent: 50, yPercent: 85, scale: 0.8, rotation: 0, layerOrder: layerOrderByCategory.shoes },
    jacket: { xPercent: 50, yPercent: 38, scale: 1.1, rotation: 0, layerOrder: layerOrderByCategory.jacket },
    dress: { xPercent: 50, yPercent: 50, scale: 1.15, rotation: 0, layerOrder: layerOrderByCategory.dress }
  };

  return suggestions[category];
}

export const defaultPlacementByCategory: Record<ClothingCategory, DefaultPlacement> = {
  jacket: getDefaultPlacementForCategory("jacket"),
  tops: getDefaultPlacementForCategory("tops"),
  dress: getDefaultPlacementForCategory("dress"),
  bottoms: getDefaultPlacementForCategory("bottoms"),
  shoes: getDefaultPlacementForCategory("shoes")
};
