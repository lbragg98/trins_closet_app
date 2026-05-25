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
  await clothingStore.iterate<ClothingItem, void>((item) => {
    items.push(item);
  });
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getClothingItemById(id: string) {
  return clothingStore.getItem<ClothingItem>(id);
}

export async function updateClothingItem(item: ClothingItem) {
  await clothingStore.setItem(item.id, item);
  return item;
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
  await outfitStore.iterate<Outfit, void>((outfit) => {
    outfits.push(outfit);
  });
  return outfits.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
  return preferenceStore.getItem<string>("customModelUri");
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
  await modelStore.iterate<SavedModel, void>((model) => {
    models.push(model);
  });
  return models.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getModelById(id: string) {
  return modelStore.getItem<SavedModel>(id);
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
  const [models, activeModelId] = await Promise.all([getModels(), preferenceStore.getItem<string>("activeModelId")]);
  if (models.length === 0) return undefined;

  return (
    models.find((model) => model.id === activeModelId) ??
    models.find((model) => model.isActive) ??
    models[0]
  );
}
