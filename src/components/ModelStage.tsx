import { ReactNode } from "react";
import { Image, StyleSheet, View } from "react-native";

import { colors } from "../theme/colors";
import { ClothingItem } from "../types/closet";
import { AppText } from "./AppText";
import { ClothingOverlayLayer } from "./ClothingOverlayLayer";

type ModelStageProps = {
  modelUri?: string;
  tops?: ClothingItem;
  bottoms?: ClothingItem;
  shoes?: ClothingItem;
  jacket?: ClothingItem;
  dress?: ClothingItem;
  children?: ReactNode;
};

export function ModelStage({
  modelUri,
  tops,
  bottoms,
  shoes,
  jacket,
  dress,
  children
}: ModelStageProps) {
  return (
    <View
      style={[
        styles.stage,
        {
          backgroundColor: "transparent",
          borderColor: "rgba(242, 201, 76, 0.28)"
        }
      ]}
    >
      <View pointerEvents="none" style={styles.softVeil} />
      <View style={styles.arch} />
      {modelUri ? (
        <Image source={{ uri: modelUri }} resizeMode="contain" style={styles.modelImage} />
      ) : (
        <View style={styles.emptyModel}>
          <AppText style={styles.emptyTitle}>No model added</AppText>
          <AppText muted style={styles.emptyCopy}>
            Add a model photo in the Model tab.
          </AppText>
        </View>
      )}
      <ClothingOverlayLayer item={bottoms} />
      <ClothingOverlayLayer item={dress} />
      <ClothingOverlayLayer item={tops} />
      <ClothingOverlayLayer item={jacket} />
      <ClothingOverlayLayer item={shoes} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: "100%",
    maxWidth: 390,
    aspectRatio: 0.72,
    alignSelf: "center",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "visible",
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 4
  },
  arch: {
    position: "absolute",
    top: "5%",
    left: "13%",
    width: "74%",
    height: "88%",
    borderWidth: 1,
    borderRadius: 120,
    borderColor: "rgba(217, 184, 245, 0.32)",
    opacity: 0.44
  },
  softVeil: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    backgroundColor: "rgba(24, 13, 40, 0.08)"
  },
  modelImage: {
    width: "100%",
    height: "100%"
  },
  emptyModel: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  emptyCopy: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center"
  }
});
