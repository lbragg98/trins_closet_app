import { ReactNode } from "react";
import { Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { sharedStyles } from "../theme/styles";
import { FairyShimmerLayer } from "./FairyShimmerLayer";

const fairyClosetBackground = require("../../assets/fairy-closet-background.png");

type ScreenScaffoldProps = {
  children: ReactNode;
};

export function ScreenScaffold({ children }: ScreenScaffoldProps) {
  return (
    <View style={styles.background}>
      <Image source={fairyClosetBackground} resizeMode="cover" style={styles.backgroundImage} />
      <View pointerEvents="none" style={styles.veil} />
      <FairyShimmerLayer />
      <SafeAreaView style={[sharedStyles.screen, styles.content]}>{children}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    minHeight: "100%",
    overflow: "hidden"
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.95,
    zIndex: 0
  },
  veil: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
    backgroundColor: "rgba(16, 8, 31, 0.34)"
  },
  content: {
    zIndex: 50
  }
});
