import localForage from "localforage";

import { ClothingItem, Outfit, SavedModel } from "../types/closet";

const clothingStore = localForage.createInstance({
  name: "perfect-closet",
  storeName: "clothing_items",
  description: "Local wardrobe items and image data"
});

const outfitStore = localForage.createInstance({
  name: "perfect-closet",
  storeName: "saved_outfits",
  description: "Local saved outfits"
});

const preferenceStore = localForage.createInstance({
  name: "perfect-closet",
  storeName: "preferences",
  description: "Local app preferences"
});

const modelStore = localForage.createInstance({
  name: "perfect-closet",
  storeName: "saved_models",
  description: "Local model photos"
});

export async function saveClothingItem(item: ClothingItem) {
  await clothingStore.setItem(item.id, item);
  return item;
}

export async function getClothingItems() {
  const items: ClothingItem[] = [];
  try {
    await clothingStore.iterate<ClothingItem, void>((item) => {
      if (item && typeof item === "object") items.push(item);
    });
    return items.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  } catch {
    return [];
  }
}

export async function getClothingItemById(id: string) {
  try {
    return clothingStore.getItem<ClothingItem>(id);
  } catch {
    return undefined;
  }
}

export async function updateClothingItem(item: ClothingItem) {
  await clothingStore.setItem(item.id, item);
  return item;
}

export async function updateWardrobeItem(id: string, updates: Partial<ClothingItem>) {
  const existing = await getClothingItemById(id);
  if (!existing) return undefined;

  const updated = {
    ...existing,
    ...updates,
    id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString()
  };
  await clothingStore.setItem(id, updated);
  return updated;
}

export async function deleteClothingItem(id: string) {
  await clothingStore.removeItem(id);
}

export async function saveOutfit(outfit: Outfit) {
  await outfitStore.setItem(outfit.id, outfit);
  return outfit;
}

export async function getOutfits() {
  const outfits: Outfit[] = [];
  try {
    await outfitStore.iterate<Outfit, void>((outfit) => {
      if (outfit && typeof outfit === "object") outfits.push(outfit);
    });
    return outfits.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  } catch {
    return [];
  }
}

export async function deleteOutfit(id: string) {
  await outfitStore.removeItem(id);
}

export async function setCustomModelUri(uri?: string) {
  if (uri) {
    await preferenceStore.setItem("customModelUri", uri);
  } else {
    await preferenceStore.removeItem("customModelUri");
  }
}

export async function getCustomModelUri() {
  try {
    return preferenceStore.getItem<string>("customModelUri");
  } catch {
    return undefined;
  }
}

export async function saveModel(model: SavedModel) {
  await modelStore.setItem(model.id, model);
  if (model.isActive) {
    await setActiveModel(model.id);
  }
  return model;
}

export async function getModels() {
  const models: SavedModel[] = [];
  try {
    await modelStore.iterate<SavedModel, void>((model) => {
      if (model && typeof model === "object") models.push(model);
    });
    return models.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  } catch {
    return [];
  }
}

export async function getModelById(id: string) {
  try {
    return modelStore.getItem<SavedModel>(id);
  } catch {
    return undefined;
  }
}

export async function updateModel(id: string, updates: Partial<SavedModel>) {
  const existing = await getModelById(id);
  if (!existing) return undefined;

  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  await modelStore.setItem(id, updated);
  return updated;
}

export async function deleteModel(id: string) {
  await modelStore.removeItem(id);
  const activeModelId = await preferenceStore.getItem<string>("activeModelId");
  if (activeModelId === id) {
    await preferenceStore.removeItem("activeModelId");
  }
}

export async function setActiveModel(id?: string) {
  const models = await getModels();
  await Promise.all(
    models.map((model) =>
      modelStore.setItem(model.id, {
        ...model,
        isActive: model.id === id,
        updatedAt: new Date().toISOString()
      })
    )
  );

  if (id) {
    await preferenceStore.setItem("activeModelId", id);
  } else {
    await preferenceStore.removeItem("activeModelId");
  }
}

export async function getActiveModel() {
  const [models, activeModelId] = await Promise.all([
    getModels(),
    preferenceStore.getItem<string>("activeModelId").catch(() => undefined)
  ]);
  if (models.length === 0) return undefined;

  return (
    models.find((model) => model.id === activeModelId) ??
    models.find((model) => model.isActive) ??
    models[0]
  );
}
