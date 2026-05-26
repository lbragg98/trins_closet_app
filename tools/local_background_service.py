import base64
import io
import os
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from withoutbg import WithoutBG

os.environ.setdefault("PYTHONIOENCODING", "utf-8")
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

SUPPORTED_TYPES = {"image/jpeg", "image/png", "image/webp"}

app = FastAPI(title="Wardrobe Whimsy Local Background Removal")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081", "http://127.0.0.1:8081"],
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

model: Optional[WithoutBG] = None


def get_model():
    global model
    if model is None:
        model = WithoutBG.opensource()
    return model


@app.get("/health")
def health():
    return {"ok": True, "model": "withoutbg.opensource"}


@app.post("/remove-background")
async def remove_background(file: UploadFile = File(...)):
    if not file.content_type or file.content_type not in SUPPORTED_TYPES:
      raise HTTPException(status_code=415, detail="Upload a JPEG, PNG, or WebP image.")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="No image data was provided.")

    try:
        Image.open(io.BytesIO(image_bytes)).verify()
    except Exception as exc:
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid image.") from exc

    try:
        output = get_model().remove_background(image_bytes)
        png_buffer = io.BytesIO()
        output.save(png_buffer, format="PNG")
        encoded = base64.b64encode(png_buffer.getvalue()).decode("ascii")
        return {
            "mimeType": "image/png",
            "dataUrl": f"data:image/png;base64,{encoded}",
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Background removal failed: {exc}") from exc
