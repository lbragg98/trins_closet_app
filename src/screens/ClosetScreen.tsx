import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, View, useColorScheme } from "react-native";

import { AppText } from "../components/AppText";
import { ScreenScaffold } from "../components/ScreenScaffold";
import { colors } from "../theme/colors";
import { sharedStyles } from "../theme/styles";
import { useClosetStore } from "../store/useClosetStore";
import { ClothingItem } from "../types/closet";
import { categories, categoryLabels } from "../utils/categories";
import { getDisplayCutoutUri } from "../utils/clothingImage";

export function ClosetScreen() {
  const scheme = useColorScheme();
  const clothingItems = useClosetStore((state) => state.clothingItems);
  const deleteClothingItem = useClosetStore((state) => state.deleteClothingItem);

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

  return (
    <ScreenScaffold>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppText style={sharedStyles.title}>Closet</AppText>
          <AppText muted style={styles.subtitle}>
            Wardrobe pieces, sorted by silhouette.
          </AppText>
        </View>

        {categories.map((category) => {
          const items = clothingItems.filter((item) => item.category === category);

          return (
            <View key={category} style={styles.section}>
              <AppText style={sharedStyles.sectionTitle}>{categoryLabels[category]}</AppText>
              <View style={styles.grid}>
                {items.map((item) => (
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
                      <Image source={{ uri: getDisplayCutoutUri(item) }} resizeMode="contain" style={styles.image} />
                    </View>
                    <AppText style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </AppText>
                    <Pressable onPress={() => confirmDelete(item)} style={styles.deleteButton}>
                      <AppText style={styles.deleteText}>Delete</AppText>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </ScreenScaffold>
  );
}

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
  section: {
    gap: 12
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  card: {
    width: "47%",
    minHeight: 178,
    shadowColor: colors.neonPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 12
  },
  thumb: {
    height: 96
  },
  image: {
    width: "100%",
    height: "100%"
  },
  itemName: {
    marginTop: 10,
    color: colors.text,
    fontWeight: "900"
  },
  deleteButton: {
    marginTop: 8
  },
  deleteText: {
    color: colors.danger,
    fontWeight: "800"
  }
});
