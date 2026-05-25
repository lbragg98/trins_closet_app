import { ClothingTransform } from "../types/closet";
import { trimTransparentPixels } from "./transparentTrim";

const loadImage = (dataUrl: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load cutout for transform export."));
    image.src = dataUrl;
  });

export function hasVisibleTransform(transform?: ClothingTransform) {
  if (!transform || transform.mode === "none") return false;

  return (
    Math.abs((transform.scaleX ?? 1) - 1) > 0.001 ||
    Math.abs((transform.scaleY ?? 1) - 1) > 0.001 ||
    Math.abs(transform.skewX ?? 0) > 0.001 ||
    Math.abs(transform.skewY ?? 0) > 0.001 ||
    Math.abs(transform.rotation ?? 0) > 0.001
  );
}

export async function exportTransformedCutout(
  cutoutDataUrl: string,
  transform: ClothingTransform
): Promise<string> {
  if (!hasVisibleTransform(transform)) return cutoutDataUrl;

  const image = await loadImage(cutoutDataUrl);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const padding = Math.ceil(Math.max(sourceWidth, sourceHeight) * 0.65);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not available for transform export.");
  }

  canvas.width = sourceWidth + padding * 2;
  canvas.height = sourceHeight + padding * 2;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(((transform.rotation ?? 0) * Math.PI) / 180);
  context.transform(
    transform.scaleX ?? 1,
    Math.tan(((transform.skewY ?? 0) * Math.PI) / 180),
    Math.tan(((transform.skewX ?? 0) * Math.PI) / 180),
    transform.scaleY ?? 1,
    0,
    0
  );
  context.drawImage(image, -sourceWidth / 2, -sourceHeight / 2, sourceWidth, sourceHeight);

  const transformedDataUrl = canvas.toDataURL("image/png");
  const trimmed = await trimTransparentPixels(transformedDataUrl);
  return trimmed.dataUrl;
}
