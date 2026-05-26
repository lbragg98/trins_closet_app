import { motion, useMotionValue } from "framer-motion";
import { CSSProperties, useEffect, useMemo, useRef } from "react";
import { Image, ImageStyle, Pressable, StyleSheet, View, useColorScheme } from "react-native";

import { colors } from "../theme/colors";
import { ClothingCategory, ClothingPlacement, ClothingTransform } from "../types/closet";
import { normalizedPlacementToLegacy, placementFramesByCategory } from "../utils/placement";
import { AppText } from "./AppText";

type ClothingTransformEditorProps = {
  modelImageUrl?: string;
  clothingCutoutUrl: string;
  category: ClothingCategory;
  initialPlacement: ClothingPlacement;
  transform: ClothingTransform;
  onPlacementChange: (placement: ClothingPlacement) => void;
  onTransformChange: (transform: ClothingTransform) => void;
  onResetPlacement: () => void;
  onResetTransform: () => void;
  onSaveTransform: () => void;
};

const stageWidth = 300;
const stageHeight = 416;

export function ClothingTransformEditor({
  modelImageUrl,
  clothingCutoutUrl,
  category,
  initialPlacement,
  transform,
  onPlacementChange,
  onTransformChange,
  onResetPlacement,
  onResetTransform,
  onSaveTransform
}: ClothingTransformEditorProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const resizeStart = useRef<{ x: number; y: number; scale: number }>();
  const warpStart = useRef<{ x: number; y: number; corner: CornerId; transform: ClothingTransform }>();
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

  const imageTransform = `scaleX(${transform.scaleX ?? 1}) scaleY(${transform.scaleY ?? 1}) skewX(${
    transform.skewX ?? 0
  }deg) skewY(${transform.skewY ?? 0}deg) rotate(${transform.rotation ?? 0}deg)`;

  const updatePlacement = (patch: Partial<ClothingPlacement>) => {
    onPlacementChange({
      ...initialPlacement,
      ...patch
    });
  };

  const updateTransform = (patch: Partial<ClothingTransform>) => {
    onTransformChange({
      scaleX: 1,
      scaleY: 1,
      skewX: 0,
      skewY: 0,
      rotation: 0,
      ...transform,
      ...patch,
      mode: "warp"
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

  const updateCornerWarp = (clientX: number, clientY: number) => {
    if (!warpStart.current) return;

    const { x, y, corner, transform: startTransform } = warpStart.current;
    const deltaX = clientX - x;
    const deltaY = clientY - y;
    const horizontal = corner.endsWith("Right") ? deltaX : -deltaX;
    const vertical = corner.startsWith("bottom") ? deltaY : -deltaY;
    const skewDirection = corner.startsWith("top") ? -1 : 1;
    const leanDirection = corner.endsWith("Left") ? -1 : 1;

    updateTransform({
      scaleX: clamp(Number(((startTransform.scaleX ?? 1) + horizontal / 180).toFixed(2)), 0.45, 1.8),
      scaleY: clamp(Number(((startTransform.scaleY ?? 1) + vertical / 180).toFixed(2)), 0.45, 1.8),
      skewX: clamp(Number(((startTransform.skewX ?? 0) + (deltaX / 18) * skewDirection).toFixed(1)), -28, 28),
      skewY: clamp(Number(((startTransform.skewY ?? 0) + (deltaY / 18) * leanDirection).toFixed(1)), -24, 24)
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
      <View style={styles.copyBlock}>
        <AppText style={styles.instructions}>Drag the item, resize the frame, then use Warp Fit to shape the cutout.</AppText>
        <AppText muted style={styles.subcopy}>
          Save Transform exports a new transparent cutout for the outfit builder.
        </AppText>
      </View>

      <View style={styles.stageShell}>
        <View style={[styles.stage, { backgroundColor: isDark ? colors.veilDark : colors.veilLight }]}>
          {modelImageUrl ? (
            <Image source={{ uri: modelImageUrl }} resizeMode="contain" style={styles.modelImage as ImageStyle} />
          ) : (
            <View style={styles.emptyModel}>
              <AppText style={styles.emptyTitle}>No model added</AppText>
            </View>
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
            <img
              src={clothingCutoutUrl}
              alt=""
              draggable={false}
              style={{ ...webStyles.cutoutImage, transform: imageTransform }}
            />
            {cornerHandles.map((handle) => (
              <button
                key={handle.id}
                type="button"
                aria-label={handle.label}
                style={{ ...webStyles.cornerHandle, ...handle.style }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  warpStart.current = {
                    x: event.clientX,
                    y: event.clientY,
                    corner: handle.id,
                    transform
                  };
                }}
                onPointerMove={(event) => updateCornerWarp(event.clientX, event.clientY)}
                onPointerUp={() => {
                  warpStart.current = undefined;
                }}
                onPointerCancel={() => {
                  warpStart.current = undefined;
                }}
              />
            ))}
            <button
              type="button"
              aria-label="Resize clothing item"
              style={webStyles.resizeHandle}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.setPointerCapture(event.pointerId);
                resizeStart.current = { x: event.clientX, y: event.clientY, scale: initialPlacement.scale };
              }}
              onPointerMove={(event) => {
                if (!resizeStart.current) return;
                const delta = Math.max(event.clientX - resizeStart.current.x, event.clientY - resizeStart.current.y) / 150;
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

      <View style={styles.toolbar}>
        <View style={styles.toolSection}>
          <AppText style={styles.toolLabel}>Position</AppText>
          <View style={styles.movePad}>
            <ToolButton label="Move up" title="Up" onPress={() => nudge(0, -1)} />
            <View style={styles.moveRow}>
              <ToolButton label="Move left" title="Left" onPress={() => nudge(-1, 0)} />
              <ToolButton label="Move down" title="Down" onPress={() => nudge(0, 1)} />
              <ToolButton label="Move right" title="Right" onPress={() => nudge(1, 0)} />
            </View>
          </View>
        </View>

        <View style={styles.toolSection}>
          <AppText style={styles.toolLabel}>Basic Fit</AppText>
          <View style={styles.buttonRow}>
            <ToolButton label="Scale down" title="Size -" onPress={() => resizeBy(-0.05)} />
            <ToolButton label="Scale up" title="Size +" onPress={() => resizeBy(0.05)} />
            <ToolButton label="Rotate left" title="Turn -" onPress={() => rotateBy(-3)} />
            <ToolButton label="Rotate right" title="Turn +" onPress={() => rotateBy(3)} />
          </View>
        </View>

        <View style={styles.toolSection}>
          <AppText style={styles.toolLabel}>Warp Fit</AppText>
          <View style={styles.buttonRow}>
            <ToolButton
              label="Narrow clothing"
              title="Width -"
              onPress={() => updateTransform({ scaleX: clamp(Number(((transform.scaleX ?? 1) - 0.04).toFixed(2)), 0.45, 1.8) })}
            />
            <ToolButton
              label="Widen clothing"
              title="Width +"
              onPress={() => updateTransform({ scaleX: clamp(Number(((transform.scaleX ?? 1) + 0.04).toFixed(2)), 0.45, 1.8) })}
            />
            <ToolButton
              label="Shorten clothing"
              title="Height -"
              onPress={() => updateTransform({ scaleY: clamp(Number(((transform.scaleY ?? 1) - 0.04).toFixed(2)), 0.45, 1.8) })}
            />
            <ToolButton
              label="Lengthen clothing"
              title="Height +"
              onPress={() => updateTransform({ scaleY: clamp(Number(((transform.scaleY ?? 1) + 0.04).toFixed(2)), 0.45, 1.8) })}
            />
            <ToolButton
              label="Skew left"
              title="Skew L"
              onPress={() => updateTransform({ skewX: clamp(Number(((transform.skewX ?? 0) - 2).toFixed(1)), -28, 28) })}
            />
            <ToolButton
              label="Skew right"
              title="Skew R"
              onPress={() => updateTransform({ skewX: clamp(Number(((transform.skewX ?? 0) + 2).toFixed(1)), -28, 28) })}
            />
            <ToolButton
              label="Lean up"
              title="Lean -"
              onPress={() => updateTransform({ skewY: clamp(Number(((transform.skewY ?? 0) - 2).toFixed(1)), -24, 24) })}
            />
            <ToolButton
              label="Lean down"
              title="Lean +"
              onPress={() => updateTransform({ skewY: clamp(Number(((transform.skewY ?? 0) + 2).toFixed(1)), -24, 24) })}
            />
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable accessibilityRole="button" onPress={onResetPlacement} style={styles.secondaryButton}>
          <AppText style={styles.secondaryText}>Reset Placement</AppText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onResetTransform} style={styles.secondaryButton}>
          <AppText style={styles.secondaryText}>Reset Transform</AppText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onSaveTransform} style={styles.saveButton}>
          <AppText style={styles.saveText}>Save Transform</AppText>
        </Pressable>
      </View>
    </View>
  );
}

type ToolButtonProps = {
  label: string;
  title: string;
  onPress: () => void;
};

type CornerId = "topLeft" | "topRight" | "bottomRight" | "bottomLeft";

const cornerHandles: Array<{ id: CornerId; label: string; style: CSSProperties }> = [
  { id: "topLeft", label: "Warp top left corner", style: { left: -7, top: -7, cursor: "nwse-resize" } },
  { id: "topRight", label: "Warp top right corner", style: { right: -7, top: -7, cursor: "nesw-resize" } },
  { id: "bottomRight", label: "Warp bottom right corner", style: { right: -7, bottom: -7, cursor: "nwse-resize" } },
  { id: "bottomLeft", label: "Warp bottom left corner", style: { left: -7, bottom: -7, cursor: "nesw-resize" } }
];

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
  copyBlock: {
    gap: 3
  },
  instructions: {
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center"
  },
  subcopy: {
    fontSize: 12,
    fontWeight: "700",
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
  emptyModel: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center"
  },
  toolbar: {
    gap: 10
  },
  toolSection: {
    gap: 6
  },
  toolLabel: {
    fontSize: 12,
    fontWeight: "900"
  },
  movePad: {
    alignItems: "center",
    gap: 5
  },
  moveRow: {
    flexDirection: "row",
    gap: 5
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  toolButton: {
    minWidth: 58,
    minHeight: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(91, 42, 131, 0.28)",
    backgroundColor: "rgba(255, 249, 255, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8
  },
  toolButtonText: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: "900"
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center"
  },
  secondaryButton: {
    minHeight: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(91, 42, 131, 0.24)",
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 249, 255, 0.82)"
  },
  secondaryText: {
    color: colors.textDark,
    fontWeight: "900",
    fontSize: 12
  },
  saveButton: {
    minHeight: 34,
    borderRadius: 6,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent
  },
  saveText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 12
  }
});

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const webStyles: Record<string, CSSProperties> = {
  cutoutImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    pointerEvents: "none",
    userSelect: "none",
    transformOrigin: "center center"
  },
  selectionBox: {
    outline: "1px solid rgba(242, 201, 76, 0.72)",
    outlineOffset: 2,
    cursor: "move"
  },
  cornerHandle: {
    position: "absolute",
    width: 13,
    height: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#5A2A83",
    backgroundColor: "#FFF9FF",
    boxShadow: "0 0 6px rgba(242, 201, 76, 0.34)",
    touchAction: "none"
  },
  resizeHandle: {
    position: "absolute",
    right: -7,
    bottom: -7,
    width: 15,
    height: 15,
    borderRadius: 3,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#5A2A83",
    backgroundColor: "#FFF9FF",
    boxShadow: "0 0 6px rgba(242, 201, 76, 0.36)",
    cursor: "nwse-resize",
    touchAction: "none"
  }
};
