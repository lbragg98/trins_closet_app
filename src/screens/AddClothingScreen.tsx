import { Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View, useColorScheme } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";

import type { RootTabParamList } from "../../App";
import { AppText } from "../components/AppText";
import { ClothingTransformEditor } from "../components/ClothingTransformEditor";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenScaffold } from "../components/ScreenScaffold";
import { removeBackgroundLocally } from "../services/backgroundRemovalClient";
import { colors } from "../theme/colors";
import { sharedStyles } from "../theme/styles";
import { useClosetStore } from "../store/useClosetStore";
import { ClothingCategory, ClothingPlacement, ClothingTransform } from "../types/closet";
import { categories, categoryLabels } from "../utils/categories";
import { pickImageFromLibrary } from "../utils/imagePicker";
import { getSuggestedPlacementForCategory, ImageDimensions, normalizedPlacementToLegacy } from "../utils/placement";
import { getImageDimensions, trimTransparentPixels } from "../utils/transparentTrim";
import { exportTransformedCutout, hasVisibleTransform } from "../utils/transformExport";

export function AddClothingScreen() {
  const route = useRoute<RouteProp<RootTabParamList, "Add">>();
  const navigation = useNavigation();
  const scheme = useColorScheme();
  const addClothingItem = useClosetStore((state) => state.addClothingItem);
  const updateClothingItem = useClosetStore((state) => state.updateClothingItem);
  const clothingItems = useClosetStore((state) => state.clothingItems);
  const customModelUri = useClosetStore((state) => state.customModelUri);
  const editItemId = route.params?.editItemId;
  const editingItem = editItemId ? clothingItems.find((item) => item.id === editItemId) : undefined;
  const [originalImageDataUrl, setOriginalImageDataUrl] = useState<string>();
  const [cutoutImageDataUrl, setCutoutImageDataUrl] = useState<string>();
  const [transformedCutoutDataUrl, setTransformedCutoutDataUrl] = useState<string>();
  const [cutoutImageDimensions, setCutoutImageDimensions] = useState<ImageDimensions>();
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [category, setCategory] = useState<ClothingCategory>("tops");
  const [placement, setPlacement] = useState<ClothingPlacement>(getSuggestedPlacementForCategory("tops"));
  const [transform, setTransform] = useState<ClothingTransform>(getEmptyTransform());
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const isDark = scheme === "dark";
  const isEditing = !!editItemId;
  const closeMissingEdit = () => {
    (navigation as unknown as { navigate: (screen: string) => void; setParams: (params: RootTabParamList["Add"]) => void }).setParams({
      editItemId: undefined
    });
    (navigation as unknown as { navigate: (screen: string) => void }).navigate("Closet");
  };

  useEffect(() => {
    if (!editingItem) return;

    setName(editingItem.name);
    setColor(editingItem.color ?? "");
    setCategory(editingItem.category);
    setOriginalImageDataUrl(editingItem.originalImageDataUrl);
    setCutoutImageDataUrl(editingItem.cutoutImageDataUrl);
    setTransformedCutoutDataUrl(editingItem.transformedCutoutDataUrl);
    setPlacement(editingItem.placement ?? getSuggestedPlacementForCategory(editingItem.category));
    setTransform(editingItem.transform ?? getEmptyTransform());
    setStatus("idle");
    setStatusMessage("");
  }, [editingItem?.id]);

  const resetPlacement = (nextCategory = category) => {
    setPlacement(getSuggestedPlacementForCategory(nextCategory));
  };

  const resetTransform = () => {
    setTransform(getEmptyTransform());
    setTransformedCutoutDataUrl(undefined);
  };

  const prepareCutout = async (dataUrl: string, successMessage: string) => {
    setStatus("loading");
    setStatusMessage("Trimming transparent padding...");

    try {
      const trimmed = await trimTransparentPixels(dataUrl);
      setCutoutImageDataUrl(trimmed.dataUrl);
      setTransformedCutoutDataUrl(undefined);
      setTransform(getEmptyTransform());
      setCutoutImageDimensions(trimmed.dimensions);
      resetPlacement();
      setStatus("success");
      setStatusMessage(successMessage);
    } catch (error) {
      const dimensions = await getImageDimensions(dataUrl);
      setCutoutImageDataUrl(dataUrl);
      setTransformedCutoutDataUrl(undefined);
      setTransform(getEmptyTransform());
      setCutoutImageDimensions(dimensions);
      resetPlacement();
      setStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Could not trim image, so the untrimmed cutout is previewed.");
    }
  };

  const chooseOriginalImage = async () => {
    setStatus("idle");
    setStatusMessage("");
    const image = await pickImageFromLibrary();
    if (image) {
      setOriginalImageDataUrl(image.dataUrl);
      setCutoutImageDataUrl(undefined);
      setTransformedCutoutDataUrl(undefined);
      setTransform(getEmptyTransform());
      setCutoutImageDimensions(undefined);
    }
  };

  const saveTransform = async () => {
    if (!cutoutImageDataUrl) return;

    setStatus("loading");
    setStatusMessage("Saving transformed transparent cutout...");

    try {
      const transformed = await exportTransformedCutout(cutoutImageDataUrl, transform);
      setTransformedCutoutDataUrl(transformed);
      setTransform({ ...transform, mode: "warp" });
      setStatus("success");
      setStatusMessage("Transform saved. The outfit builder will use this shaped cutout.");
    } catch (error) {
      setStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Could not save the transformed cutout.");
    }
  };

  const chooseCutoutImage = async () => {
    setStatus("loading");
    setStatusMessage("Loading transparent cutout...");
    const image = await pickImageFromLibrary();
    if (image) {
      await prepareCutout(image.dataUrl, "Cutout trimmed and auto-placed.");
    } else {
      setStatus("idle");
      setStatusMessage("");
    }
  };

  const removeBackground = async () => {
    if (!originalImageDataUrl) {
      setStatus("error");
      setStatusMessage("Choose an original clothing image first.");
      return;
    }

    setStatus("loading");
    setStatusMessage("Removing background in your browser. The first run may take a little while.");

    try {
      const result = await removeBackgroundLocally(originalImageDataUrl, setStatusMessage);
      await prepareCutout(result.dataUrl, "Background removed, trimmed, and auto-placed.");
    } catch (error) {
      setStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Browser background removal failed.");
    }
  };

  const useOriginalAsCutout = () => {
    if (!originalImageDataUrl) {
      setStatus("error");
      setStatusMessage("Choose an original clothing image first.");
      return;
    }

    void prepareCutout(
      originalImageDataUrl,
      "Saved preview is using the uploaded image. Transparent cutouts work best."
    );
  };

  const save = async () => {
    const trimmedName = name.trim();
    if (!originalImageDataUrl) {
      Alert.alert("Choose an image", "Select a transparent clothing image from your photos first.");
      return;
    }
    if (!cutoutImageDataUrl) {
      Alert.alert("Prepare a cutout", "Add a transparent cutout or use the uploaded image before saving.");
      return;
    }
    if (!trimmedName) {
      Alert.alert("Name the item", "Add a short name so it is easy to find in the carousel.");
      return;
    }

    let finalTransformedCutoutDataUrl = transformedCutoutDataUrl;

    if (!finalTransformedCutoutDataUrl && hasVisibleTransform(transform)) {
      setStatus("loading");
      setStatusMessage("Saving transformed transparent cutout...");
      try {
        finalTransformedCutoutDataUrl = await exportTransformedCutout(cutoutImageDataUrl, transform);
        setTransformedCutoutDataUrl(finalTransformedCutoutDataUrl);
      } catch (error) {
        setStatus("error");
        setStatusMessage(error instanceof Error ? error.message : "Could not save the transformed cutout.");
        return;
      }
    }

    const legacyPlacement = normalizedPlacementToLegacy(category, placement);
    const itemUpdates = {
      name: trimmedName,
      color: color.trim() || undefined,
      category,
      originalImageDataUrl,
      cutoutImageDataUrl,
      transformedCutoutDataUrl: finalTransformedCutoutDataUrl,
      x: legacyPlacement.x,
      y: legacyPlacement.y,
      scale: placement.scale,
      rotation: placement.rotation,
      layerOrder: placement.layerOrder,
      placement,
      transform,
      updatedAt: new Date().toISOString()
    };

    if (editingItem) {
      updateClothingItem(editingItem.id, itemUpdates);
      setStatus("success");
      setStatusMessage("Clothing item updated locally.");
      Alert.alert("Updated", `${trimmedName} was saved.`);
      (navigation as unknown as { navigate: (screen: string) => void; setParams: (params: RootTabParamList["Add"]) => void }).setParams({
        editItemId: undefined
      });
      (navigation as unknown as { navigate: (screen: string) => void }).navigate("Closet");
      return;
    }

    addClothingItem(itemUpdates);

    setName("");
    setColor("");
    setOriginalImageDataUrl(undefined);
    setCutoutImageDataUrl(undefined);
    setTransformedCutoutDataUrl(undefined);
    setCutoutImageDimensions(undefined);
    setCategory("tops");
    setPlacement(getSuggestedPlacementForCategory("tops"));
    setTransform(getEmptyTransform());
    setStatus("success");
    setStatusMessage("Clothing item saved locally.");
    Alert.alert("Added", `${trimmedName} is now in your closet.`);
  };

  if (isEditing && !editingItem) {
    return (
      <ScreenScaffold>
        <View style={styles.missingEdit}>
          <AppText style={sharedStyles.title}>Item not found</AppText>
          <AppText muted style={styles.subtitle}>
            This clothing item may have been deleted or moved. Return to the closet and choose another item.
          </AppText>
          <PrimaryButton title="Back to Closet" onPress={closeMissingEdit} />
        </View>
      </ScreenScaffold>
    );
  }

  return (
    <ScreenScaffold>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppText style={sharedStyles.title}>{isEditing ? "Edit Clothing" : "Add Clothing"}</AppText>
          <AppText muted style={styles.subtitle}>
            {isEditing ? "Update this piece without re-uploading the image." : "Add another piece to the collection."}
          </AppText>
        </View>

        <View style={styles.previewRow}>
          <Pressable
            onPress={chooseOriginalImage}
            style={[
              styles.imagePicker,
              {
                backgroundColor: "rgba(35, 18, 55, 0.76)",
                borderColor: "rgba(255, 183, 240, 0.58)"
              }
            ]}
          >
            <AppText style={styles.previewLabel}>Original</AppText>
            {originalImageDataUrl ? (
              <Image source={{ uri: originalImageDataUrl }} resizeMode="contain" style={styles.previewImage} />
            ) : (
              <AppText muted style={styles.pickerText}>Choose Photo</AppText>
            )}
          </Pressable>

          <Pressable
            onPress={chooseCutoutImage}
            style={[
              styles.imagePicker,
              {
                backgroundColor: "rgba(35, 18, 55, 0.76)",
                borderColor: cutoutImageDataUrl ? colors.accentSoft : "rgba(255, 183, 240, 0.58)"
              }
            ]}
          >
            <AppText style={styles.previewLabel}>Cutout</AppText>
            {cutoutImageDataUrl ? (
              <Image source={{ uri: cutoutImageDataUrl }} resizeMode="contain" style={styles.previewImage} />
            ) : (
              <AppText muted style={styles.pickerText}>
                Choose PNG
              </AppText>
            )}
          </Pressable>
        </View>

        <View style={styles.actionStack}>
          <PrimaryButton
            title={status === "loading" ? "Removing Background..." : "Remove Background"}
            onPress={removeBackground}
            disabled={!originalImageDataUrl || status === "loading"}
          />
          <PrimaryButton title="Upload Transparent Cutout" variant="ghost" onPress={chooseCutoutImage} />
          <PrimaryButton title="Use Original as Cutout" variant="ghost" onPress={useOriginalAsCutout} />
          {!!statusMessage && (
            <AppText
              style={[
                styles.statusText,
                status === "error" && { color: colors.danger },
                status === "success" && { color: colors.accentSoft }
              ]}
            >
              {statusMessage}
            </AppText>
          )}
        </View>

        <View style={styles.field}>
          <AppText style={sharedStyles.label}>Name</AppText>
          <TextInput
            value={name}
            onChangeText={setName}
            style={[
              sharedStyles.input,
              {
                color: "#12091F",
                backgroundColor: colors.surface,
                borderColor: isDark ? colors.borderDark : colors.border
              }
            ]}
          />
        </View>

        <View style={styles.field}>
          <AppText style={sharedStyles.label}>Color</AppText>
          <TextInput
            value={color}
            onChangeText={setColor}
            style={[
              sharedStyles.input,
              {
                color: "#12091F",
                backgroundColor: colors.surface,
                borderColor: isDark ? colors.borderDark : colors.border
              }
            ]}
          />
        </View>

        <View style={styles.field}>
          <AppText style={sharedStyles.label}>Category</AppText>
          <View style={styles.categoryGrid}>
            {categories.map((entry) => {
              const selected = entry === category;
              return (
                <Pressable
                  key={entry}
                  onPress={() => {
                    setCategory(entry);
                    setPlacement(getSuggestedPlacementForCategory(entry));
                  }}
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor: selected ? "rgba(123, 44, 191, 0.92)" : "rgba(35, 18, 55, 0.76)",
                      borderColor: selected ? colors.neonPinkSoft : "rgba(255, 183, 240, 0.58)"
                    }
                  ]}
                >
                  <AppText style={[styles.categoryText, selected && styles.selectedCategoryText]}>
                    {categoryLabels[entry]}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {cutoutImageDataUrl && (
          <View style={styles.field}>
            <AppText style={sharedStyles.label}>Visual Placement & Transform</AppText>
            <ClothingTransformEditor
              modelImageUrl={customModelUri}
              clothingCutoutUrl={transformedCutoutDataUrl ?? cutoutImageDataUrl}
              category={category}
              initialPlacement={placement}
              transform={transformedCutoutDataUrl ? getEmptyTransform() : transform}
              onPlacementChange={setPlacement}
              onResetPlacement={() => resetPlacement()}
              onTransformChange={(nextTransform) => {
                setTransformedCutoutDataUrl(undefined);
                setTransform(nextTransform);
              }}
              onResetTransform={resetTransform}
              onSaveTransform={saveTransform}
            />
          </View>
        )}

        <PrimaryButton title={isEditing ? "Save Changes" : "Save Clothing Item"} onPress={save} disabled={!cutoutImageDataUrl} />
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingBottom: 24
  },
  missingEdit: {
    gap: 16,
    paddingVertical: 24
  },
  header: {
    paddingTop: 8
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15
  },
  previewRow: {
    flexDirection: "row",
    gap: 12
  },
  imagePicker: {
    flex: 1,
    height: 220,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  previewLabel: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 2,
    fontSize: 12,
    fontWeight: "900"
  },
  previewImage: {
    width: "100%",
    height: "100%",
    marginTop: 20
  },
  pickerText: {
    fontSize: 15,
    fontWeight: "800"
  },
  actionStack: {
    gap: 10
  },
  statusText: {
    fontSize: 13,
    fontWeight: "800"
  },
  field: {
    gap: 8
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  categoryPill: {
    minHeight: 46,
    minWidth: "47%",
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14
  },
  categoryText: {
    color: colors.text,
    fontWeight: "900"
  },
  selectedCategoryText: {
    color: colors.accentSoft
  }
});

function getEmptyTransform(): ClothingTransform {
  return {
    mode: "none",
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    rotation: 0
  };
}
