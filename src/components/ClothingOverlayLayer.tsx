import { Image, ImageStyle, StyleSheet, View } from "react-native";

import { ClothingItem } from "../types/closet";
import { getDisplayCutoutUri } from "../utils/clothingImage";
import {
  getDefaultPlacementForCategory,
  normalizedPlacementToLegacy,
  placementFramesByCategory
} from "../utils/placement";
import { PlaceholderVisual } from "./PlaceholderVisual";

type ClothingOverlayLayerProps = {
  item?: ClothingItem;
};

export function ClothingOverlayLayer({ item }: ClothingOverlayLayerProps) {
  if (!item) return null;

  const fallbackPlacement = getDefaultPlacementForCategory(item.category);
  const normalizedLegacy = item.placement ? normalizedPlacementToLegacy(item.category, item.placement) : undefined;
  const frame = placementFramesByCategory[item.category];
  const x = normalizedLegacy?.x ?? (Number.isFinite(item.x) ? item.x : fallbackPlacement.x);
  const y = normalizedLegacy?.y ?? (Number.isFinite(item.y) ? item.y : fallbackPlacement.y);
  const scale = item.placement?.scale ?? item.scale ?? fallbackPlacement.scale;
  const rotation = item.placement?.rotation ?? (Number.isFinite(item.rotation) ? item.rotation : fallbackPlacement.rotation);
  const layerOrder = item.placement?.layerOrder ?? item.layerOrder ?? fallbackPlacement.layerOrder;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.zone,
        {
          top: `${y}%`,
          left: `${x}%`,
          width: `${frame.width * scale}%`,
          height: `${frame.height * scale}%`,
          zIndex: layerOrder,
          transform: [{ rotate: `${rotation}deg` }]
        }
      ]}
    >
      {item.isPlaceholder ? (
        <PlaceholderVisual category={item.category} name={item.name} compact />
      ) : (
        <Image source={{ uri: getDisplayCutoutUri(item) }} resizeMode="contain" style={styles.image as ImageStyle} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    position: "absolute"
  },
  image: {
    width: "100%",
    height: "100%"
  }
});
