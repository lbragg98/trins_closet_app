import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, View, useColorScheme } from "react-native";

import { colors } from "../theme/colors";
import { ClothingItem } from "../types/closet";
import { getDisplayCutoutUri } from "../utils/clothingImage";
import { AppText } from "./AppText";
import { OrbCategory } from "./CategoryOrbs";
import { PlaceholderVisual } from "./PlaceholderVisual";

type ClothingCarouselProps = {
  activeCategory: OrbCategory;
  items: ClothingItem[];
  selectedItemId?: string;
  onPreviewChange: (item?: ClothingItem) => void;
  onConfirmItem: (item: ClothingItem) => void;
};

const itemWidth = 104;
const itemGap = 12;
const step = itemWidth + itemGap;
const dragThreshold = Math.min(40, itemWidth * 0.18);
const virtualOffsets = [-2, -1, 0, 1, 2];

function wrapIndex(index: number, length: number) {
  if (length === 0) return 0;
  return ((index % length) + length) % length;
}

export function ClothingCarousel({
  activeCategory,
  items,
  selectedItemId,
  onPreviewChange,
  onConfirmItem
}: ClothingCarouselProps) {
  const scheme = useColorScheme();
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const snapTimer = useRef<ReturnType<typeof setTimeout>>();
  const lastTap = useRef(0);

  const snapOffsetToZero = () => {
    animate(x, 0, {
      type: "spring",
      stiffness: reduceMotion ? 500 : 260,
      damping: reduceMotion ? 48 : 34,
      mass: 0.8
    });
  };

  const clearSnapTimer = () => {
    if (snapTimer.current) clearTimeout(snapTimer.current);
  };

  const scheduleSnap = () => {
    clearSnapTimer();
    snapTimer.current = setTimeout(snapOffsetToZero, 2000);
  };

  const visibleItems = useMemo(() => {
    if (items.length === 0) return [];

    return virtualOffsets.map((offset) => {
      const index = wrapIndex(currentIndex + offset, items.length);
      return {
        item: items[index],
        index,
        offset
      };
    });
  }, [currentIndex, items]);

  useEffect(() => {
    const selectedIndex = Math.max(
      0,
      items.findIndex((item) => item.id === selectedItemId)
    );
    const nextIndex = items.length > 0 ? selectedIndex : 0;
    x.set(0);
    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);

    return clearSnapTimer;
  }, [activeCategory]);

  useEffect(() => {
    if (items.length === 0) {
      onPreviewChange(undefined);
      return;
    }

    const wrappedIndex = wrapIndex(currentIndex, items.length);
    if (wrappedIndex !== currentIndex) {
      currentIndexRef.current = wrappedIndex;
      setCurrentIndex(wrappedIndex);
      return;
    }

    currentIndexRef.current = wrappedIndex;
    onPreviewChange(items[wrappedIndex]);
  }, [currentIndex, items, onPreviewChange]);

  if (items.length === 0) {
    return (
      <View pointerEvents="box-none" style={styles.emptyWrap}>
        <View style={[styles.emptyMessage, { backgroundColor: scheme === "dark" ? colors.surfaceDark : colors.surface }]}>
          <AppText style={styles.emptyTitle}>No {activeCategory}s added yet</AppText>
          <AppText muted style={styles.emptySubtitle}>
            Add clothing to use this category
          </AppText>
        </View>
      </View>
    );
  }

  const confirmCurrentItem = () => {
    const activeItem = items[currentIndexRef.current];
    if (activeItem) onConfirmItem(activeItem);
  };

  const handleDragEnd = () => {
    const offset = x.get();
    setCurrentIndex((previousIndex) => {
      let nextIndex = previousIndex;

      if (offset < -dragThreshold) {
        nextIndex = wrapIndex(previousIndex + 1, items.length);
      } else if (offset > dragThreshold) {
        nextIndex = wrapIndex(previousIndex - 1, items.length);
      }

      currentIndexRef.current = nextIndex;
      return nextIndex;
    });
    snapOffsetToZero();
    scheduleSnap();
  };

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <motion.div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          x,
          cursor: items.length > 1 ? "grab" : "default",
          touchAction: "pan-y"
        }}
        drag={items.length > 1 ? "x" : false}
        dragMomentum={false}
        dragElastic={0.02}
        dragConstraints={{ left: -step, right: step }}
        onDragStart={clearSnapTimer}
        onDragEnd={handleDragEnd}
      >
        {visibleItems.map(({ item, index, offset }) => {
          const isCentered = offset === 0;
          const isSelected = item.id === selectedItemId;

          return (
            <motion.div
              key={`${item.id}-${offset}-${index}`}
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                width: itemWidth,
                marginLeft: -itemWidth / 2,
                x: offset * step,
                zIndex: isCentered ? 4 : 3 - Math.abs(offset)
              }}
              animate={{
                scale: isCentered ? 1.06 : Math.abs(offset) === 1 ? 0.9 : 0.78,
                opacity: isCentered ? 1 : Math.abs(offset) === 1 ? 0.64 : 0.36
              }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Preview ${item.name}. Double tap to select.`}
                onPress={() => {
                  const now = Date.now();
                  if (now - lastTap.current < 320) {
                    confirmCurrentItem();
                  }
                  lastTap.current = now;
                }}
                // @ts-expect-error React Native Web forwards double click for desktop users.
                onDoubleClick={confirmCurrentItem}
                style={[
                  styles.card,
                  {
                    borderColor: isCentered ? colors.accentSoft : isSelected ? colors.accent : "rgba(255,255,255,0.24)",
                    backgroundColor: scheme === "dark" ? "rgba(33,20,49,0.82)" : "rgba(255,249,255,0.86)"
                  }
                ]}
              >
                <View style={styles.imageWrap}>
                  {item.isPlaceholder ? (
                    <PlaceholderVisual category={item.category} name={item.name} compact />
                  ) : (
                    <Image source={{ uri: getDisplayCutoutUri(item) }} resizeMode="contain" style={styles.image} />
                  )}
                </View>
                <AppText style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </AppText>
                {isCentered ? (
                  <AppText style={styles.selectedText}>Previewing</AppText>
                ) : (
                  isSelected && <AppText style={styles.selectedText}>Selected</AppText>
                )}
              </Pressable>
            </motion.div>
          );
        })}
      </motion.div>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: "50%",
    bottom: "4%",
    width: 328,
    marginLeft: -164,
    height: 138,
    overflow: "hidden",
    zIndex: 75
  },
  card: {
    height: 126,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    alignItems: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 16
  },
  imageWrap: {
    height: 72,
    width: "100%"
  },
  image: {
    width: "100%",
    height: "100%"
  },
  itemName: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center"
  },
  selectedText: {
    marginTop: 2,
    color: colors.accentSoft,
    fontSize: 10,
    fontWeight: "900"
  },
  emptyWrap: {
    position: "absolute",
    left: "12%",
    right: "12%",
    bottom: "13%",
    zIndex: 75
  },
  emptyMessage: {
    borderWidth: 1,
    borderColor: "rgba(242, 201, 76, 0.46)",
    borderRadius: 8,
    padding: 14,
    alignItems: "center"
  },
  emptyTitle: {
    fontWeight: "900",
    textAlign: "center"
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 12,
    textAlign: "center"
  }
});
