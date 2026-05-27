import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";

import { AppText } from "../components/AppText";
import { CategoryOrbs, OrbCategory } from "../components/CategoryOrbs";
import { ClothingCarousel } from "../components/ClothingCarousel";
import { ModelStage } from "../components/ModelStage";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenScaffold } from "../components/ScreenScaffold";
import { sharedStyles } from "../theme/styles";
import { useClosetStore } from "../store/useClosetStore";
import { ClothingCategory, ClothingItem } from "../types/closet";

type PreviewSelection = {
  category: ClothingCategory;
  itemId: string | null;
};

export function OutfitBuilderScreen() {
  const [activeCategory, setActiveCategory] = useState<OrbCategory | null>(
    null,
  );
  const [previewItem, setPreviewItem] = useState<PreviewSelection | undefined>();
  const {
    clothingItems,
    selectedItems,
    customModelUri,
    saveOutfit,
    setSelectedItem,
  } = useClosetStore();

  const getRenderedItem = (category: ClothingCategory) => {
    if (previewItem?.category === category) {
      return previewItem.itemId ? clothingItems.find((item) => item.id === previewItem.itemId && item.category === category) : undefined;
    }

    const selectedId = selectedItems[category];
    return selectedId ? clothingItems.find((item) => item.id === selectedId && item.category === category) : undefined;
  };

  useEffect(() => {
    if (!previewItem?.itemId) return;

    const previewStillExists = clothingItems.some(
      (item) => item.id === previewItem.itemId && item.category === previewItem.category
    );
    if (!previewStillExists) setPreviewItem(undefined);
  }, [clothingItems, previewItem]);

  const handleSave = () => {
    saveOutfit();
    Alert.alert("Saved", "This outfit is saved locally on your device.");
  };

  const handleCategorySelect = (category: OrbCategory) => {
    setActiveCategory((current) => {
      const nextCategory = current === category ? null : category;
      if (nextCategory === null) setPreviewItem(undefined);
      return nextCategory;
    });
  };

  const handleConfirmItem = (item?: ClothingItem) => {
    if (!item && activeCategory) {
      setSelectedItem(activeCategory, null);
    } else if (item) {
      setSelectedItem(item.category, item.id);
    }

    setPreviewItem(undefined);
    setActiveCategory(null);
  };

  const activeItems = activeCategory
    ? clothingItems.filter((item) => item?.id && item.category === activeCategory)
    : [];

  return (
    <ScreenScaffold>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <AppText style={sharedStyles.title}>Wardrobe Whimsy</AppText>
        </View>

        <ModelStage
          modelUri={customModelUri}
          tops={getRenderedItem("tops")}
          bottoms={getRenderedItem("bottoms")}
          shoes={getRenderedItem("shoes")}
          dress={getRenderedItem("dress")}
          jacket={getRenderedItem("jacket")}
        >
          <CategoryOrbs
            activeCategory={activeCategory}
            onCategorySelect={handleCategorySelect}
          />
          {activeCategory && (
            <ClothingCarousel
              activeCategory={activeCategory}
              items={activeItems}
              selectedItemId={selectedItems[activeCategory] ?? null}
              onPreviewChange={(item) => {
                setPreviewItem({
                  category: activeCategory,
                  itemId: item?.id ?? null
                });
              }}
              onConfirmItem={handleConfirmItem}
            />
          )}
        </ModelStage>

        <PrimaryButton title="Save Outfit" onPress={handleSave} />
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingBottom: 24,
  },
  header: {
    paddingTop: 8,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
  },
});
