import { StyleSheet, View, useColorScheme } from "react-native";

import { colors } from "../theme/colors";
import { ClothingCategory } from "../types/closet";
import { AppText } from "./AppText";

type PlaceholderVisualProps = {
  category?: ClothingCategory | "model";
  name?: string;
  compact?: boolean;
};

const categoryColor: Record<ClothingCategory | "model", string> = {
  top: colors.accent,
  bottom: colors.blue,
  shoes: colors.green,
  jacket: colors.rose,
  dress: colors.accentSoft,
  model: "#B99ACF"
};

export function PlaceholderVisual({ category = "model", name, compact }: PlaceholderVisualProps) {
  const scheme = useColorScheme();
  const fill = categoryColor[category];

  if (category === "model") {
    return (
      <View style={[styles.modelWrap, { backgroundColor: scheme === "dark" ? "#2A1A3B" : "#F2E7FF" }]}>
        <View style={[styles.head, { backgroundColor: fill }]} />
        <View style={[styles.neck, { backgroundColor: fill }]} />
        <View style={[styles.torso, { backgroundColor: fill }]} />
        <View style={styles.legs}>
          <View style={[styles.leg, { backgroundColor: fill }]} />
          <View style={[styles.leg, { backgroundColor: fill }]} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.itemWrap,
        compact && styles.compactItem,
        { borderColor: fill, backgroundColor: scheme === "dark" ? "#251636" : "#FFF8FF" }
      ]}
    >
      <View style={[styles.itemShape, { backgroundColor: fill }]} />
      {!!name && !compact && (
        <AppText style={styles.itemLabel} numberOfLines={2}>
          {name}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  modelWrap: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: "8%",
    overflow: "hidden"
  },
  head: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 999
  },
  neck: {
    width: "7%",
    height: "5%",
    borderRadius: 8
  },
  torso: {
    width: "34%",
    height: "30%",
    borderRadius: 24
  },
  legs: {
    flexDirection: "row",
    gap: 12,
    height: "38%",
    marginTop: 4
  },
  leg: {
    width: 32,
    borderRadius: 16
  },
  itemWrap: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 8
  },
  compactItem: {
    minHeight: 72
  },
  itemShape: {
    width: "68%",
    height: "56%",
    borderRadius: 8
  },
  itemLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center"
  }
});
