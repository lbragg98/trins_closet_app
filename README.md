# Perfect Closet

Perfect Closet is a local-only Expo React Native outfit visualizer. Upload transparent clothing images, swipe through pieces by category, and preview outfits layered over a fixed model like a digital paper doll.

## Run

```bash
npm install
npm start
```

## Local Background Removal

Perfect Closet uses the open-source local `withoutbg` model through a localhost helper. This does not require API keys, cloud storage, or payment setup.

```bash
python -m pip install withoutbg fastapi uvicorn python-multipart pillow
npm run bg:local
```

Keep that service running while using the Add Clothing screen's `Remove Background` button.

## Product Rules

- No AI features
- No backend, authentication, or cloud storage
- No drag, resize, pinch, or transform handles in the main builder
- The main outfit builder stays swipe-based
- Item placement values are captured only when adding an item
- New cutouts are trimmed and auto-placed from fixed model anchors
