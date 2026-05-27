import { motion, useReducedMotion } from "framer-motion";
import { Pressable, StyleSheet, View } from "react-native";

import { colors } from "../theme/colors";
import { ClothingCategory } from "../types/closet";
import { AppText } from "./AppText";

type MagicalCategoryOrbProps = {
  category: ClothingCategory;
  label: string;
  isActive: boolean;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  onPress: (category: ClothingCategory) => void;
};

const categoryInitials: Partial<Record<ClothingCategory, string>> = {
  tops: "T",
  bottoms: "B",
  shoes: "S",
  dress: "D",
  jacket: "J"
};

export function MagicalCategoryOrb({ category, label, isActive, position, onPress }: MagicalCategoryOrbProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      style={{
        position: "absolute",
        zIndex: 80,
        ...position
      }}
      animate={
        reduceMotion
          ? undefined
          : {
              y: [0, -5, 0],
              scale: isActive ? [1.04, 1.1, 1.04] : [1, 1.04, 1]
            }
      }
      transition={{
        duration: 3.8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Select ${label.toLowerCase()}`}
        accessibilityState={{ selected: isActive }}
        onPress={() => onPress(category)}
        style={({ pressed }) => [
          styles.orb,
          isActive && styles.activeOrb,
          pressed && styles.pressedOrb
        ]}
      >
        <View style={[styles.innerGlow, isActive && styles.activeInnerGlow]} />
        <AppText style={styles.initial}>{categoryInitials[category]}</AppText>
        <AppText style={styles.label} numberOfLines={1}>
          {label}
        </AppText>
      </Pressable>
    </motion.div>
  );
}

const styles = StyleSheet.create({
  orb: {
    width: 72,
    height: 72,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 183, 240, 0.82)",
    backgroundColor: "rgba(45, 18, 72, 0.82)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.neonPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.66,
    shadowRadius: 22
  },
  activeOrb: {
    borderColor: colors.accentSoft,
    backgroundColor: "rgba(123, 44, 191, 0.92)"
  },
  pressedOrb: {
    opacity: 0.82
  },
  innerGlow: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "rgba(255, 79, 216, 0.28)"
  },
  activeInnerGlow: {
    backgroundColor: "rgba(255, 232, 163, 0.34)"
  },
  initial: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    textShadowColor: colors.neonPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8
  },
  label: {
    marginTop: 2,
    color: colors.text,
    fontSize: 10,
    fontWeight: "900",
    textShadowColor: colors.neonPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8
  }
});
