import { ImageDimensions } from "./placement";

export type TrimmedImage = {
  dataUrl: string;
  dimensions: ImageDimensions;
};

const loadImage = (dataUrl: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image for trimming."));
    image.src = dataUrl;
  });

export async function getImageDimensions(dataUrl: string): Promise<ImageDimensions> {
  const image = await loadImage(dataUrl);
  return {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height
  };
}

export async function trimTransparentPixels(fileOrBlob: string | Blob): Promise<TrimmedImage> {
  const dataUrl =
    typeof fileOrBlob === "string"
      ? fileOrBlob
      : await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Could not read image blob."));
          reader.readAsDataURL(fileOrBlob);
        });

  const image = await loadImage(dataUrl);
  const sourceCanvas = document.createElement("canvas");
  const sourceContext = sourceCanvas.getContext("2d");

  if (!sourceContext) {
    throw new Error("Canvas is not available for image trimming.");
  }

  sourceCanvas.width = image.naturalWidth || image.width;
  sourceCanvas.height = image.naturalHeight || image.height;
  sourceContext.drawImage(image, 0, 0);

  const pixels = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  let minX = sourceCanvas.width;
  let minY = sourceCanvas.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < sourceCanvas.height; y += 1) {
    for (let x = 0; x < sourceCanvas.width; x += 1) {
      const alpha = pixels.data[(y * sourceCanvas.width + x) * 4 + 3];
      if (alpha > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return {
      dataUrl,
      dimensions: {
        width: sourceCanvas.width,
        height: sourceCanvas.height
      }
    };
  }

  const croppedWidth = maxX - minX + 1;
  const croppedHeight = maxY - minY + 1;
  const croppedCanvas = document.createElement("canvas");
  const croppedContext = croppedCanvas.getContext("2d");

  if (!croppedContext) {
    throw new Error("Canvas is not available for image trimming.");
  }

  croppedCanvas.width = croppedWidth;
  croppedCanvas.height = croppedHeight;
  croppedContext.drawImage(
    sourceCanvas,
    minX,
    minY,
    croppedWidth,
    croppedHeight,
    0,
    0,
    croppedWidth,
    croppedHeight
  );

  return {
    dataUrl: croppedCanvas.toDataURL("image/png"),
    dimensions: {
      width: croppedWidth,
      height: croppedHeight
    }
  };
}
