const LOCAL_BACKGROUND_REMOVAL_URL =
  process.env.EXPO_PUBLIC_LOCAL_BG_REMOVAL_URL ?? "http://localhost:8765/remove-background";

type RemoveBackgroundResult = {
  dataUrl: string;
  mimeType: string;
};

async function dataUrlToBlob(dataUrl: string) {
  const response = await fetch(dataUrl);
  return response.blob();
}

export async function removeBackgroundLocally(originalImageDataUrl: string): Promise<RemoveBackgroundResult> {
  const formData = new FormData();
  formData.append("file", await dataUrlToBlob(originalImageDataUrl), "clothing-image.png");

  const response = await fetch(LOCAL_BACKGROUND_REMOVAL_URL, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Local background removal failed.");
  }

  return response.json() as Promise<RemoveBackgroundResult>;
}
