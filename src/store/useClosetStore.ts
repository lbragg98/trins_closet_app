import { create } from "zustand";

import * as localClosetStorage from "../services/localClosetStorage";
import { ClothingCategory, ClothingItem, Outfit, SavedModel } from "../types/closet";
import { categories, normalizeCategory } from "../utils/categories";
import { getDefaultPlacementForCategory, legacyPlacementToNormalized } from "../utils/placement";

type StoredClosetState = {
  clothingItems: ClothingItem[];
  outfits: Outfit[];
  models: SavedModel[];
};

export type SelectedItems = Partial<Record<ClothingCategory, string | null>>;

type ClosetState = StoredClosetState & {
  selectedItems: SelectedItems;
  customModelUri?: string;
  activeModelId?: string;
  isHydrated: boolean;
  addClothingItem: (item: Omit<ClothingItem, "id" | "createdAt">) => void;
  updateClothingItem: (id: string, updates: Partial<Omit<ClothingItem, "id" | "createdAt">>) => void;
  deleteClothingItem: (id: string) => void;
  deleteOutfit: (id: string) => void;
  saveOutfit: (name?: string) => void;
  setSelectedItem: (category: ClothingCategory, id?: string | null) => void;
  cycleSelectedItem: (category: ClothingCategory, direction: "previous" | "next") => void;
  saveModel: (model: Omit<SavedModel, "id" | "createdAt" | "updatedAt">) => void;
  deleteModel: (id: string) => void;
  setActiveModel: (id?: string) => void;
  setCustomModelUri: (uri?: string) => void;
  hydrateFromStorage: () => Promise<void>;
};

const emptySelectedItems = (): SelectedItems =>
  Object.fromEntries(categories.map((category) => [category, null])) as SelectedItems;

const createId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeClothingItem = (item: ClothingItem): ClothingItem | undefined => {
  const category = normalizeCategory(item.category);
  if (!category) return undefined;

  const legacyItem = item as ClothingItem & { imageUri?: string };
  const placement = getDefaultPlacementForCategory(category);

  return {
    ...item,
    category,
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
      legacyPlacementToNormalized(category, {
        x: Number.isFinite(item.x) ? item.x : placement.x,
        y: Number.isFinite(item.y) ? item.y : placement.y,
        scale: Number.isFinite(item.scale) ? item.scale : placement.scale,
        rotation: Number.isFinite(item.rotation) ? item.rotation : placement.rotation,
        layerOrder: Number.isFinite(item.layerOrder) ? item.layerOrder : placement.layerOrder
      })
  };
};

const normalizeSavedClothingItems = (items: ClothingItem[]) =>
  items
    .filter((item) => !(item as ClothingItem & { isPlaceholder?: boolean }).isPlaceholder)
    .map(normalizeClothingItem)
    .filter((item): item is ClothingItem => item !== undefined);

const normalizeOutfit = (outfit: Outfit): Outfit => {
  const selectedItemIds: Partial<Record<ClothingCategory, string[]>> = {};

  Object.entries(outfit.selectedItemIds).forEach(([rawCategory, ids]) => {
    const category = normalizeCategory(rawCategory);
    if (category) selectedItemIds[category] = ids;
  });

  return {
    ...outfit,
    selectedItemIds
  };
};

const selectedItemsFromClothing = (items: ClothingItem[]): SelectedItems => ({
  ...emptySelectedItems(),
  tops: items.find((item) => item.category === "tops")?.id ?? null,
  bottoms: items.find((item) => item.category === "bottoms")?.id ?? null,
  shoes: items.find((item) => item.category === "shoes")?.id ?? null,
  dress: items.find((item) => item.category === "dress")?.id ?? null,
  jacket: items.find((item) => item.category === "jacket")?.id ?? null
});

export const useClosetStore = create<ClosetState>((set, get) => ({
  clothingItems: [],
  outfits: [],
  models: [],
  selectedItems: emptySelectedItems(),
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

  updateClothingItem: (id, updates) => {
    const existing = get().clothingItems.find((entry) => entry.id === id);
    if (!existing) return;

    const previousCategory = existing.category;
    const nextCategory = updates.category ?? existing.category;
    const updatedItem: ClothingItem = {
      ...existing,
      ...updates,
      category: nextCategory,
      updatedAt: new Date().toISOString()
    };

    set((state) => {
      const selectedItems = { ...state.selectedItems };
      if (previousCategory !== nextCategory && selectedItems[previousCategory] === id) {
        selectedItems[previousCategory] = null;
        selectedItems[nextCategory] = id;
      }

      const nextState = {
        ...state,
        clothingItems: state.clothingItems.map((entry) => (entry.id === id ? updatedItem : entry)),
        selectedItems
      };
      void localClosetStorage.updateClothingItem(updatedItem);
      return nextState;
    });
  },

  deleteClothingItem: (id) => {
    const item = get().clothingItems.find((entry) => entry.id === id);
    if (!item) return;

    set((state) => {
      const clothingItems = state.clothingItems.filter((entry) => entry.id !== id);
      const selectedItems = Object.fromEntries(
        categories.map((category) => [category, state.selectedItems[category] === id ? null : state.selectedItems[category] ?? null])
      ) as SelectedItems;
      const nextState = {
        ...state,
        clothingItems,
        selectedItems,
        outfits: state.outfits.map((outfit) => ({
          ...outfit,
          selectedItemIds: Object.fromEntries(
            Object.entries(outfit.selectedItemIds).map(([category, ids]) => [
              category,
              ids?.filter((itemId) => itemId !== id)
            ])
          )
        }))
      };
      void localClosetStorage.deleteClothingItem(id);
      return nextState;
    });
  },

  saveOutfit: (name) => {
    set((state) => {
      const outfitNumber = state.outfits.length + 1;
      const selectedItemIds = Object.fromEntries(
        categories.map((category) => {
          const selectedId = state.selectedItems[category];
          return [category, selectedId ? [selectedId] : []];
        })
      ) as Partial<Record<ClothingCategory, string[]>>;
      const nextState = {
        ...state,
        outfits: [
          {
            id: createId("outfit"),
            name: name?.trim() || `Outfit ${outfitNumber}`,
            selectedItemIds,
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
    set((state) => ({
      ...state,
      selectedItems: {
        ...state.selectedItems,
        [category]: id ?? null
      }
    }));
  },

  cycleSelectedItem: (category, direction) => {
    const items = get().clothingItems.filter((item) => item.category === category);
    if (items.length === 0) return;

    const selected = get().selectedItems[category];
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
      const clothingItems = normalizeSavedClothingItems(savedClothingItems);
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
        normalizedModels = normalizedModels.map((model) => ({ ...model, isActive: entryIsModel(model, normalizedActiveModel) }));
        void localClosetStorage.setActiveModel(normalizedActiveModel.id);
      } else if (normalizedActiveModel) {
        normalizedModels = normalizedModels.map((model) => ({ ...model, isActive: entryIsModel(model, normalizedActiveModel) }));
      }

      set({
        clothingItems,
        outfits: outfits.map(normalizeOutfit),
        models: normalizedModels,
        selectedItems: selectedItemsFromClothing(clothingItems),
        activeModelId: normalizedActiveModel?.id,
        customModelUri: normalizedActiveModel?.imageDataUrl,
        isHydrated: true
      });
    } catch {
      set({ isHydrated: true });
    }
  }
}));

const entryIsModel = (model: SavedModel, activeModel?: SavedModel) => model.id === activeModel?.id;
