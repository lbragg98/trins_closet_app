import { Platform } from "react-native";

const CONFIGURED_BACKGROUND_REMOVAL_URL =
  (process.env as Record<string, string | undefined>)["EXPO_PUBLIC_BACKGROUND_REMOVAL_URL"] ??
  (process.env as Record<string, string | undefined>)["EXPO_PUBLIC_LOCAL_BG_REMOVAL_URL"];

const LOCAL_BACKGROUND_REMOVAL_URL = CONFIGURED_BACKGROUND_REMOVAL_URL ?? "http://localhost:8765/remove-background";

type RemoveBackgroundResult = {
  dataUrl: string;
  mimeType: string;
};

async function dataUrlToBlob(dataUrl: string) {
  const response = await fetch(dataUrl);
  return response.blob();
}

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the transparent cutout."));
    reader.readAsDataURL(blob);
  });
}

async function removeBackgroundInBrowser(
  originalImageDataUrl: string,
  onProgress?: (message: string) => void
): Promise<RemoveBackgroundResult> {
  if (Platform.OS !== "web") {
    throw new Error("Browser background removal is only available on web.");
  }

  onProgress?.("Loading browser background remover. The first run downloads the model.");

  const cutoutBlob = await removeBackgroundInWorker(await dataUrlToBlob(originalImageDataUrl), onProgress);
  return {
    dataUrl: await blobToDataUrl(cutoutBlob),
    mimeType: cutoutBlob.type || "image/png"
  };
}

async function removeBackgroundInWorker(
  originalBlob: Blob,
  onProgress?: (message: string) => void
): Promise<Blob> {
  if (typeof Worker === "undefined") {
    throw new Error("This browser does not support the background-removal worker.");
  }

  const workerUrl = URL.createObjectURL(
    new Blob(
      [
        `
          import { removeBackground } from "https://esm.sh/@imgly/background-removal@1.7.0?deps=onnxruntime-web@1.21.0";

          self.onmessage = async (event) => {
            try {
              const result = await removeBackground(event.data, {
                model: "isnet_quint8",
                output: { format: "image/png" },
                progress: (key, current, total) => {
                  self.postMessage({ type: "progress", key, current, total });
                }
              });
              self.postMessage({ type: "success", blob: result });
            } catch (error) {
              self.postMessage({
                type: "error",
                message: error instanceof Error ? error.message : "Browser background removal failed."
              });
            }
          };
        `
      ],
      { type: "text/javascript" }
    )
  );

  return new Promise((resolve, reject) => {
    const worker = new Worker(workerUrl, { type: "module" });
    const timeout = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      reject(new Error("Browser background removal timed out."));
    }, 120000);

    worker.onmessage = (event: MessageEvent) => {
      const data = event.data as
        | { type: "progress"; key: string; current: number; total: number }
        | { type: "success"; blob: Blob }
        | { type: "error"; message: string };

      if (data.type === "progress") {
        if (data.total > 0) {
          onProgress?.(`Loading ${data.key}... ${Math.round((data.current / data.total) * 100)}%`);
        }
        return;
      }

      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);

      if (data.type === "success") {
        resolve(data.blob);
      } else {
        reject(new Error(data.message));
      }
    };

    worker.onerror = (event) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      reject(new Error(event.message || "Browser background removal failed."));
    };

    worker.postMessage(originalBlob);
  });
}

async function removeBackgroundViaApi(originalImageDataUrl: string): Promise<RemoveBackgroundResult> {
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

export async function removeBackgroundLocally(
  originalImageDataUrl: string,
  onProgress?: (message: string) => void
): Promise<RemoveBackgroundResult> {
  if (Platform.OS === "web") {
    try {
      return await removeBackgroundInBrowser(originalImageDataUrl, onProgress);
    } catch (error) {
      if (!CONFIGURED_BACKGROUND_REMOVAL_URL) {
        throw error;
      }
    }
  }

  return removeBackgroundViaApi(originalImageDataUrl);
}
