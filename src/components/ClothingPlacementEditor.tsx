import { motion, useMotionValue } from "framer-motion";
import { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";
import { Image, ImageStyle, Pressable, StyleSheet, View, useColorScheme } from "react-native";

import { colors } from "../theme/colors";
import { ClothingCategory, ClothingPlacement } from "../types/closet";
import { normalizedPlacementToLegacy, placementFramesByCategory } from "../utils/placement";
import { AppText } from "./AppText";
import { PlaceholderVisual } from "./PlaceholderVisual";

type ClothingPlacementEditorProps = {
  modelImageUrl?: string;
  clothingCutoutUrl: string;
  category: ClothingCategory;
  initialPlacement: ClothingPlacement;
  onPlacementChange: (placement: ClothingPlacement) => void;
  onResetPlacement: () => void;
};

const stageWidth = 300;
const stageHeight = 416;

export function ClothingPlacementEditor({
  modelImageUrl,
  clothingCutoutUrl,
  category,
  initialPlacement,
  onPlacementChange,
  onResetPlacement
}: ClothingPlacementEditorProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const resizeStart = useRef<{ x: number; scale: number }>();
  const frame = placementFramesByCategory[category];
  const legacy = normalizedPlacementToLegacy(category, initialPlacement);
  const itemWidth = (frame.width / 100) * stageWidth * initialPlacement.scale;
  const itemHeight = (frame.height / 100) * stageHeight * initialPlacement.scale;

  useEffect(() => {
    dragX.set(0);
    dragY.set(0);
  }, [category, clothingCutoutUrl, initialPlacement.xPercent, initialPlacement.yPercent, dragX, dragY]);

  const itemStyle = useMemo(
    () => ({
      position: "absolute" as const,
      left: `${legacy.x}%`,
      top: `${legacy.y}%`,
      width: itemWidth,
      height: itemHeight,
      rotate: initialPlacement.rotation,
      x: dragX,
      y: dragY,
      touchAction: "none" as const,
      zIndex: 12
    }),
    [dragX, dragY, initialPlacement.rotation, itemHeight, itemWidth, legacy.x, legacy.y]
  );

  const updatePlacement = (patch: Partial<ClothingPlacement>) => {
    onPlacementChange({
      ...initialPlacement,
      ...patch
    });
  };

  const nudge = (deltaX: number, deltaY: number) => {
    updatePlacement({
      xPercent: clamp(initialPlacement.xPercent + deltaX, 0, 100),
      yPercent: clamp(initialPlacement.yPercent + deltaY, 0, 100)
    });
  };

  const resizeBy = (delta: number) => {
    updatePlacement({
      scale: clamp(Number((initialPlacement.scale + delta).toFixed(2)), 0.2, 2.8)
    });
  };

  const rotateBy = (delta: number) => {
    updatePlacement({
      rotation: Number((initialPlacement.rotation + delta).toFixed(1))
    });
  };

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: isDark ? "rgba(33, 20, 49, 0.66)" : "rgba(255, 249, 255, 0.82)",
          borderColor: isDark ? colors.borderDark : colors.border
        }
      ]}
    >
      <AppText style={styles.instructions}>Drag, resize, and rotate until it fits.</AppText>
      <View style={styles.stageShell}>
        <View style={[styles.stage, { backgroundColor: isDark ? colors.veilDark : colors.veilLight }]}>
          {modelImageUrl ? (
            <Image source={{ uri: modelImageUrl }} resizeMode="contain" style={styles.modelImage as ImageStyle} />
          ) : (
            <PlaceholderVisual category="model" />
          )}

          <motion.div
            drag
            dragMomentum={false}
            style={{ ...itemStyle, ...webStyles.selectionBox }}
            onDragEnd={(_, info) => {
              updatePlacement({
                xPercent: clamp(initialPlacement.xPercent + (info.offset.x / stageWidth) * 100, 0, 100),
                yPercent: clamp(initialPlacement.yPercent + (info.offset.y / stageHeight) * 100, 0, 100)
              });
              dragX.set(0);
              dragY.set(0);
            }}
          >
            <img src={clothingCutoutUrl} alt="" draggable={false} style={webStyles.cutoutImage} />
            <button
              type="button"
              aria-label="Resize clothing item"
              style={webStyles.resizeHandle}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.setPointerCapture(event.pointerId);
                resizeStart.current = { x: event.clientX, scale: initialPlacement.scale };
              }}
              onPointerMove={(event) => {
                if (!resizeStart.current) return;
                const delta = (event.clientX - resizeStart.current.x) / 140;
                updatePlacement({
                  scale: clamp(Number((resizeStart.current.scale + delta).toFixed(2)), 0.2, 2.8)
                });
              }}
              onPointerUp={() => {
                resizeStart.current = undefined;
              }}
              onPointerCancel={() => {
                resizeStart.current = undefined;
              }}
            />
          </motion.div>
        </View>
      </View>

      <View style={styles.controlGrid}>
        <View style={styles.movePad}>
          <ToolButton label="Move up" title="↑" onPress={() => nudge(0, -1)} />
          <View style={styles.moveRow}>
            <ToolButton label="Move left" title="←" onPress={() => nudge(-1, 0)} />
            <ToolButton label="Move down" title="↓" onPress={() => nudge(0, 1)} />
            <ToolButton label="Move right" title="→" onPress={() => nudge(1, 0)} />
          </View>
        </View>
        <View style={styles.toolGroup}>
          <ToolButton label="Scale down" title="−" onPress={() => resizeBy(-0.05)} />
          <ToolButton label="Scale up" title="+" onPress={() => resizeBy(0.05)} />
          <ToolButton label="Rotate left" title="↺" onPress={() => rotateBy(-3)} />
          <ToolButton label="Rotate right" title="↻" onPress={() => rotateBy(3)} />
        </View>
      </View>

      <Pressable accessibilityRole="button" onPress={onResetPlacement} style={styles.resetButton}>
        <AppText style={styles.resetText}>Reset to suggested placement</AppText>
      </Pressable>
    </View>
  );
}

type ToolButtonProps = {
  label: string;
  title: string;
  onPress: () => void;
};

function ToolButton({ label, title, onPress }: ToolButtonProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.toolButton}>
      <AppText style={styles.toolButtonText}>{title}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 10
  },
  instructions: {
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center"
  },
  stageShell: {
    alignItems: "center"
  },
  stage: {
    width: stageWidth,
    height: stageHeight,
    borderWidth: 1,
    borderColor: "rgba(242, 201, 76, 0.36)",
    borderRadius: 8,
    overflow: "hidden"
  },
  modelImage: {
    width: "100%",
    height: "100%"
  },
  controlGrid: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  movePad: {
    alignItems: "center",
    gap: 4
  },
  moveRow: {
    flexDirection: "row",
    gap: 4
  },
  toolGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    maxWidth: 144,
    gap: 6
  },
  toolButton: {
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(91, 42, 131, 0.35)",
    backgroundColor: "rgba(255, 249, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center"
  },
  toolButtonText: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: "900"
  },
  resetButton: {
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center"
  },
  resetText: {
    color: colors.accentSoft,
    fontWeight: "900"
  }
});

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const webStyles: Record<string, CSSProperties> = {
  cutoutImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    pointerEvents: "none",
    userSelect: "none"
  },
  selectionBox: {
    outline: "1px solid rgba(242, 201, 76, 0.72)",
    outlineOffset: 2,
    cursor: "move"
  },
  resizeHandle: {
    position: "absolute",
    right: -8,
    bottom: -8,
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#5A2A83",
    backgroundColor: "#FFF9FF",
    boxShadow: "0 0 8px rgba(242, 201, 76, 0.42)",
    cursor: "nwse-resize",
    touchAction: "none"
  }
};
