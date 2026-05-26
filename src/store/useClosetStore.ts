import { create } from "zustand";

import { placeholderClothingItems } from "../data/placeholders";
import * as localClosetStorage from "../services/localClosetStorage";
import { ClothingCategory, ClothingItem, Outfit, SavedModel } from "../types/closet";
import { getDefaultPlacementForCategory, legacyPlacementToNormalized } from "../utils/placement";

type StoredClosetState = {
  clothingItems: ClothingItem[];
  outfits: Outfit[];
  models: SavedModel[];
};

type ClosetState = StoredClosetState & {
  selectedTopId?: string;
  selectedBottomId?: string;
  selectedShoesId?: string;
  selectedJacketId?: string;
  selectedDressId?: string;
  customModelUri?: string;
  activeModelId?: string;
  isHydrated: boolean;
  addClothingItem: (item: Omit<ClothingItem, "id" | "createdAt">) => void;
  deleteClothingItem: (id: string) => void;
  deleteOutfit: (id: string) => void;
  saveOutfit: (name?: string) => void;
  setSelectedItem: (category: ClothingCategory, id?: string) => void;
  cycleSelectedItem: (category: ClothingCategory, direction: "previous" | "next") => void;
  saveModel: (model: Omit<SavedModel, "id" | "createdAt" | "updatedAt">) => void;
  deleteModel: (id: string) => void;
  setActiveModel: (id?: string) => void;
  setCustomModelUri: (uri?: string) => void;
  hydrateFromStorage: () => Promise<void>;
};

const defaultSelection = {
  selectedTopId: "placeholder-top-tee",
  selectedBottomId: "placeholder-bottom-jeans",
  selectedShoesId: "placeholder-shoes-sneakers",
  selectedJacketId: undefined,
  selectedDressId: undefined
};

const normalizeClothingItem = (item: ClothingItem): ClothingItem | undefined => {
  if (!isSupportedCategory(item.category)) return undefined;

  const legacyItem = item as ClothingItem & { imageUri?: string };
  const placement = getDefaultPlacementForCategory(item.category);

  return {
    ...item,
    originalImageDataUrl: item.originalImageDataUrl ?? legacyItem.imageUri ?? item.cutoutImageDataUrl,
    cutoutImageDataUrl: item.cutoutImageDataUrl ?? legacyItem.imageUri ?? item.originalImageDataUrl,
    ...(item.transformedCutoutDataUrl ? { transformedCutoutDataUrl: item.transformedCutoutDataUrl } : {}),
    transform: item.transform ?? { mode: "none", scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, rotation: 0 },
    x: Number.isFinite(item.x) ? item.x : placement.x,
    y: Number.isFinite(item.y) ? item.y : placement.y,
    scale: Number.isFinite(item.scale) ? item.scale : placement.scale,
    rotation: Number.isFinite(item.rotation) ? item.rotation : placement.rotation,
    layerOrder: Number.isFinite(item.layerOrder) ? item.layerOrder : placement.layerOrder,
    placement:
      item.placement ??
      legacyPlacementToNormalized(item.category, {
        x: Number.isFinite(item.x) ? item.x : placement.x,
        y: Number.isFinite(item.y) ? item.y : placement.y,
        scale: Number.isFinite(item.scale) ? item.scale : placement.scale,
        rotation: Number.isFinite(item.rotation) ? item.rotation : placement.rotation,
        layerOrder: Number.isFinite(item.layerOrder) ? item.layerOrder : placement.layerOrder
      })
  };
};

const ensurePlaceholders = (items: ClothingItem[]) => {
  const savedItems = items
    .filter((item) => !item.isPlaceholder)
    .map(normalizeClothingItem)
    .filter((item): item is ClothingItem => item !== undefined);
  return [...placeholderClothingItems, ...savedItems];
};

const isSupportedCategory = (category: string): category is ClothingCategory =>
  category === "top" || category === "bottom" || category === "shoes" || category === "jacket" || category === "dress";

const createId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const getSelectedKey = (category: ClothingCategory) => {
  if (category === "top") return "selectedTopId";
  if (category === "bottom") return "selectedBottomId";
  if (category === "shoes") return "selectedShoesId";
  if (category === "jacket") return "selectedJacketId";
  return "selectedDressId";
};

export const useClosetStore = create<ClosetState>((set, get) => ({
  clothingItems: placeholderClothingItems,
  outfits: [],
  models: [],
  selectedTopId: defaultSelection.selectedTopId,
  selectedBottomId: defaultSelection.selectedBottomId,
  selectedShoesId: defaultSelection.selectedShoesId,
  selectedJacketId: defaultSelection.selectedJacketId,
  selectedDressId: defaultSelection.selectedDressId,
  customModelUri: undefined,
  activeModelId: undefined,
  isHydrated: false,

  addClothingItem: (item) => {
    const newItem: ClothingItem = {
      ...item,
      id: createId("clothing"),
      createdAt: new Date().toISOString()
    };

    set((state) => {
      const nextState = {
        ...state,
        clothingItems: [...state.clothingItems, newItem]
      };
      void localClosetStorage.saveClothingItem(newItem);
      return nextState;
    });

    get().setSelectedItem(newItem.category, newItem.id);
  },

  deleteClothingItem: (id) => {
    const item = get().clothingItems.find((entry) => entry.id === id);
    if (!item || item.isPlaceholder) return;

    set((state) => {
      const clothingItems = state.clothingItems.filter((entry) => entry.id !== id);
      const nextByCategory = clothingItems.find((entry) => entry.category === item.category)?.id;
      const nextState = {
        ...state,
        clothingItems,
        outfits: state.outfits.map((outfit) => ({
          ...outfit,
          selectedItemIds: Object.fromEntries(
            Object.entries(outfit.selectedItemIds).map(([category, ids]) => [
              category,
              ids?.filter((itemId) => itemId !== id)
            ])
          )
        })),
        selectedTopId: state.selectedTopId === id ? nextByCategory : state.selectedTopId,
        selectedBottomId: state.selectedBottomId === id ? nextByCategory : state.selectedBottomId,
        selectedShoesId: state.selectedShoesId === id ? nextByCategory : state.selectedShoesId,
        selectedJacketId: state.selectedJacketId === id ? nextByCategory : state.selectedJacketId,
        selectedDressId: state.selectedDressId === id ? nextByCategory : state.selectedDressId
      };
      void localClosetStorage.deleteClothingItem(id);
      return nextState;
    });
  },

  saveOutfit: (name) => {
    set((state) => {
      const outfitNumber = state.outfits.length + 1;
      const nextState = {
        ...state,
        outfits: [
          {
            id: createId("outfit"),
            name: name?.trim() || `Outfit ${outfitNumber}`,
            selectedItemIds: {
              top: state.selectedTopId ? [state.selectedTopId] : [],
              bottom: state.selectedBottomId ? [state.selectedBottomId] : [],
              shoes: state.selectedShoesId ? [state.selectedShoesId] : [],
              jacket: state.selectedJacketId ? [state.selectedJacketId] : [],
              dress: state.selectedDressId ? [state.selectedDressId] : []
            },
            createdAt: new Date().toISOString()
          },
          ...state.outfits
        ]
      };
      void localClosetStorage.saveOutfit(nextState.outfits[0]);
      return nextState;
    });
  },

  deleteOutfit: (id) => {
    set((state) => {
      const nextState = { ...state, outfits: state.outfits.filter((outfit) => outfit.id !== id) };
      void localClosetStorage.deleteOutfit(id);
      return nextState;
    });
  },

  setSelectedItem: (category, id) => {
    set((state) => {
      const selectedKey = getSelectedKey(category);
      const nextState = { ...state, [selectedKey]: id };
      return nextState;
    });
  },

  cycleSelectedItem: (category, direction) => {
    const items = get().clothingItems.filter((item) => item.category === category);
    if (items.length === 0) return;

    const selected =
      category === "top"
        ? get().selectedTopId
        : category === "bottom"
          ? get().selectedBottomId
          : category === "shoes"
            ? get().selectedShoesId
            : category === "jacket"
              ? get().selectedJacketId
              : get().selectedDressId;

    const currentIndex = Math.max(
      0,
      items.findIndex((item) => item.id === selected)
    );
    const delta = direction === "next" ? 1 : -1;
    const nextIndex = (currentIndex + delta + items.length) % items.length;

    get().setSelectedItem(category, items[nextIndex].id);
  },

  setCustomModelUri: (uri) => {
    if (!uri) {
      get().setActiveModel(undefined);
      return;
    }

    get().saveModel({
      name: "Model",
      imageDataUrl: uri,
      imageUrl: uri,
      isActive: true
    });
  },

  saveModel: (model) => {
    const now = new Date().toISOString();
    const newModel: SavedModel = {
      ...model,
      id: createId("model"),
      imageUrl: model.imageUrl ?? model.imageDataUrl,
      createdAt: now,
      updatedAt: now
    };

    set((state) => {
      const shouldActivate = newModel.isActive || state.models.length === 0;
      const models = shouldActivate
        ? [newModel, ...state.models].map((entry) => ({ ...entry, isActive: entry.id === newModel.id }))
        : [newModel, ...state.models];
      const activeModel = models.find((entry) => entry.isActive);
      const nextState = {
        ...state,
        models,
        activeModelId: activeModel?.id,
        customModelUri: activeModel?.imageDataUrl
      };

      void localClosetStorage.saveModel({ ...newModel, isActive: shouldActivate });
      if (shouldActivate) void localClosetStorage.setActiveModel(newModel.id);
      return nextState;
    });
  },

  deleteModel: (id) => {
    set((state) => {
      const model = state.models.find((entry) => entry.id === id);
      if (!model) return state;

      const remaining = state.models.filter((entry) => entry.id !== id);
      const nextActive = model.isActive ? remaining[0] : remaining.find((entry) => entry.isActive);
      const models = remaining.map((entry) => ({ ...entry, isActive: entry.id === nextActive?.id }));
      const nextState = {
        ...state,
        models,
        activeModelId: nextActive?.id,
        customModelUri: nextActive?.imageDataUrl
      };

      void localClosetStorage.deleteModel(id).then(() => localClosetStorage.setActiveModel(nextActive?.id));
      return nextState;
    });
  },

  setActiveModel: (id) => {
    set((state) => {
      const nextActive = id ? state.models.find((model) => model.id === id) : undefined;
      const models = state.models.map((model) => ({ ...model, isActive: model.id === nextActive?.id }));
      const nextState = {
        ...state,
        models,
        activeModelId: nextActive?.id,
        customModelUri: nextActive?.imageDataUrl
      };

      void localClosetStorage.setActiveModel(nextActive?.id);
      return nextState;
    });
  },

  hydrateFromStorage: async () => {
    try {
      const [savedClothingItems, outfits, models, activeModel, legacyCustomModelUri] = await Promise.all([
        localClosetStorage.getClothingItems(),
        localClosetStorage.getOutfits(),
        localClosetStorage.getModels(),
        localClosetStorage.getActiveModel(),
        localClosetStorage.getCustomModelUri()
      ]);
      const clothingItems = ensurePlaceholders(savedClothingItems);
      let normalizedModels = models;
      let normalizedActiveModel = activeModel;

      if (normalizedModels.length === 0 && legacyCustomModelUri) {
        const now = new Date().toISOString();
        normalizedActiveModel = {
          id: createId("model"),
          name: "Saved Model",
          imageDataUrl: legacyCustomModelUri,
          imageUrl: legacyCustomModelUri,
          isActive: true,
          createdAt: now,
          updatedAt: now
        };
        normalizedModels = [normalizedActiveModel];
        void localClosetStorage.saveModel(normalizedActiveModel);
      } else if (!normalizedActiveModel && normalizedModels.length > 0) {
        normalizedActiveModel = normalizedModels[0];
        normalizedModels = normalizedModels.map((model) => ({ ...model, isActive: model.id === normalizedActiveModel?.id }));
        void localClosetStorage.setActiveModel(normalizedActiveModel.id);
      } else if (normalizedActiveModel) {
        normalizedModels = normalizedModels.map((model) => ({ ...model, isActive: model.id === normalizedActiveModel?.id }));
      }

      set({
        clothingItems,
        outfits,
        models: normalizedModels,
        selectedTopId: defaultSelection.selectedTopId,
        selectedBottomId: defaultSelection.selectedBottomId,
        selectedShoesId: defaultSelection.selectedShoesId,
        selectedJacketId: defaultSelection.selectedJacketId,
        selectedDressId: defaultSelection.selectedDressId,
        activeModelId: normalizedActiveModel?.id,
        customModelUri: normalizedActiveModel?.imageDataUrl,
        isHydrated: true
      });
    } catch {
      set({ isHydrated: true });
    }
  }
}));
