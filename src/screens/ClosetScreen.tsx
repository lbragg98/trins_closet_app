import { Alert, FlatList, Image, Platform, Pressable, StyleSheet, View, useColorScheme } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { memo, useEffect, useMemo, useState } from "react";

import type { RootTabParamList } from "../../App";
import { AppText } from "../components/AppText";
import { ScreenScaffold } from "../components/ScreenScaffold";
import { colors } from "../theme/colors";
import { sharedStyles } from "../theme/styles";
import { useClosetStore } from "../store/useClosetStore";
import { ClothingItem } from "../types/closet";
import { categories, categoryLabels } from "../utils/categories";
import { getDisplayCutoutUri } from "../utils/clothingImage";
import { createThumbnailDataUrl } from "../utils/thumbnail";

type ClosetListEntry =
  | {
      type: "header";
      id: "header";
    }
  | {
      type: "section";
      id: string;
      label: string;
    }
  | {
      type: "row";
      id: string;
      items: ClothingItem[];
    };

export function ClosetScreen() {
  const scheme = useColorScheme();
  const navigation = useNavigation();
  const clothingItems = useClosetStore((state) => state.clothingItems);
  const isHydrated = useClosetStore((state) => state.isHydrated);
  const deleteClothingItem = useClosetStore((state) => state.deleteClothingItem);
  const updateClothingItem = useClosetStore((state) => state.updateClothingItem);
  const closetRows = useMemo<ClosetListEntry[]>(() => {
    const rows: ClosetListEntry[] = [{ type: "header", id: "header" }];

    categories.forEach((category) => {
      const items = clothingItems.filter((item) => item?.id && item.category === category);
      rows.push({ type: "section", id: `section-${category}`, label: categoryLabels[category] });

      for (let index = 0; index < items.length; index += 2) {
        rows.push({
          type: "row",
          id: `row-${category}-${items[index]?.id ?? index}`,
          items: items.slice(index, index + 2)
        });
      }
    });

    return rows;
  }, [clothingItems]);

  const confirmDelete = (item: ClothingItem) => {
    const message = `${item.name} will be removed from this device.`;

    if (Platform.OS === "web") {
      if (window.confirm(`${message}\n\nDelete this item?`)) {
        deleteClothingItem(item.id);
      }
      return;
    }

    Alert.alert("Delete item?", `${item.name} will be removed from this device.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteClothingItem(item.id) }
    ]);
  };

  const editItem = (id: string) => {
    if (!isHydrated) return;

    const item = clothingItems.find((entry) => entry.id === id);
    if (!item) return;

    (navigation as unknown as { navigate: (screen: keyof RootTabParamList, params?: RootTabParamList["Add"]) => void }).navigate("Add", {
      editItemId: item.id
    });
  };

  const renderItem = ({ item: entry }: { item: ClosetListEntry }) => {
    if (entry.type === "header") {
      return (
        <View style={styles.header}>
          <AppText style={sharedStyles.title}>Closet</AppText>
          <AppText muted style={styles.subtitle}>
            {isHydrated ? "Wardrobe pieces, sorted by silhouette." : "Loading your local closet..."}
          </AppText>
        </View>
      );
    }

    if (entry.type === "section") {
      return (
        <View style={styles.sectionHeader}>
          <AppText style={sharedStyles.sectionTitle}>{entry.label}</AppText>
        </View>
      );
    }

    return (
      <View style={styles.gridRow}>
        {entry.items.map((item) => renderCard(item))}
        {entry.items.length === 1 && <View style={styles.cardSpacer} />}
      </View>
    );
  };

  const renderCard = (item: ClothingItem) => {
    return (
      <View
        key={item.id}
        style={[
          sharedStyles.card,
          styles.card,
          {
            backgroundColor: "rgba(35, 18, 55, 0.78)",
            borderColor: "rgba(255, 183, 240, 0.46)"
          }
        ]}
      >
        <View style={styles.thumb}>
          <ClosetThumbnail item={item} onThumbnailReady={(thumbnailDataUrl) => updateClothingItem(item.id, { thumbnailDataUrl })} />
        </View>
        <AppText style={styles.itemName} numberOfLines={1}>
          {item.name || "Untitled item"}
        </AppText>
        <View style={styles.buttonRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !isHydrated }}
            disabled={!isHydrated}
            onPress={() => editItem(item.id)}
            style={[styles.editButton, !isHydrated && styles.disabledButton]}
          >
            <AppText style={styles.editText}>Edit</AppText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => confirmDelete(item)} style={styles.deleteButton}>
            <AppText style={styles.deleteText}>Delete</AppText>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <ScreenScaffold>
      <FlatList
        data={closetRows}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        initialNumToRender={8}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
      />
    </ScreenScaffold>
  );
}

const ClosetThumbnail = memo(function ClosetThumbnail({
  item,
  onThumbnailReady
}: {
  item: ClothingItem;
  onThumbnailReady: (thumbnailDataUrl: string) => void;
}) {
  const sourceUri = getDisplayCutoutUri(item);
  const [thumbnailUri, setThumbnailUri] = useState(item.thumbnailDataUrl);

  useEffect(() => {
    let cancelled = false;
    setThumbnailUri(item.thumbnailDataUrl);

    if (!sourceUri) return;
    if (item.thumbnailDataUrl) return;

    void createThumbnailDataUrl(sourceUri)
      .then((thumbnailDataUrl) => {
        if (cancelled) return;
        setThumbnailUri(thumbnailDataUrl);
        onThumbnailReady(thumbnailDataUrl);
      })
      .catch(() => {
        if (!cancelled) setThumbnailUri(undefined);
      });

    return () => {
      cancelled = true;
    };
  }, [item.id, item.thumbnailDataUrl, onThumbnailReady, sourceUri]);

  if (!thumbnailUri) {
    return (
      <View style={styles.missingThumb}>
        <AppText style={styles.missingThumbText}>{sourceUri ? "Loading" : "No preview"}</AppText>
      </View>
    );
  }

  return <Image source={{ uri: thumbnailUri }} resizeMode="contain" style={styles.image} />;
});

const styles = StyleSheet.create({
  content: {
    gap: 22,
    paddingBottom: 24
  },
  header: {
    paddingTop: 8
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15
  },
  sectionHeader: {
    marginTop: 6
  },
  gridRow: {
    flexDirection: "row",
    gap: 12
  },
  card: {
    flex: 1,
    minHeight: 178,
    shadowColor: colors.neonPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 12
  },
  cardSpacer: {
    flex: 1
  },
  thumb: {
    height: 96
  },
  image: {
    width: "100%",
    height: "100%"
  },
  missingThumb: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 232, 163, 0.36)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 249, 255, 0.1)"
  },
  missingThumbText: {
    color: colors.accentSoft,
    fontSize: 12,
    fontWeight: "900"
  },
  itemName: {
    marginTop: 10,
    color: colors.text,
    fontWeight: "900"
  },
  buttonRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 10
  },
  editButton: {
    minHeight: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 232, 163, 0.56)",
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 249, 255, 0.12)"
  },
  editText: {
    color: colors.accentSoft,
    fontWeight: "900"
  },
  disabledButton: {
    opacity: 0.48
  },
  deleteButton: {
    minHeight: 30,
    justifyContent: "center"
  },
  deleteText: {
    color: colors.danger,
    fontWeight: "800"
  }
});
