import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useState } from "react";

import { AppText } from "../components/AppText";
import { CategoryOrbs, OrbCategory } from "../components/CategoryOrbs";
import { ClothingCarousel } from "../components/ClothingCarousel";
import { ModelStage } from "../components/ModelStage";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenScaffold } from "../components/ScreenScaffold";
import { sharedStyles } from "../theme/styles";
import { useClosetStore } from "../store/useClosetStore";
import { ClothingItem } from "../types/closet";

export function OutfitBuilderScreen() {
  const [activeCategory, setActiveCategory] = useState<OrbCategory | null>(null);
  const [previewItem, setPreviewItem] = useState<ClothingItem | undefined>();
  const {
    clothingItems,
    selectedTopId,
    selectedBottomId,
    selectedShoesId,
    selectedJacketId,
    selectedDressId,
    selectedAccessoryIds,
    customModelUri,
    saveOutfit,
    setSelectedItem
  } = useClosetStore();

  const top = clothingItems.find((item) => item.id === selectedTopId);
  const bottom = clothingItems.find((item) => item.id === selectedBottomId);
  const shoes = clothingItems.find((item) => item.id === selectedShoesId);
  const jacket = clothingItems.find((item) => item.id === selectedJacketId);
  const dress = clothingItems.find((item) => item.id === selectedDressId);
  const accessories = clothingItems.filter((item) => selectedAccessoryIds.includes(item.id));

  const selectedByCategory: Record<OrbCategory, string | undefined> = {
    top: selectedTopId,
    bottom: selectedBottomId,
    shoes: selectedShoesId,
    accessory: selectedAccessoryIds[0]
  };

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

  const handleConfirmItem = (item: ClothingItem) => {
    setSelectedItem(item.category, item.id);
    setPreviewItem(undefined);
    setActiveCategory(null);
  };

  const activeItems = activeCategory ? clothingItems.filter((item) => item.category === activeCategory) : [];

  return (
    <ScreenScaffold>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppText style={sharedStyles.title}>Perfect Closet</AppText>
          <AppText muted style={styles.subtitle}>
            A moonlit fitting room for favorite pieces.
          </AppText>
        </View>

        <ModelStage
          modelUri={customModelUri}
          top={top}
          bottom={bottom}
          shoes={shoes}
          jacket={jacket}
          dress={dress}
          accessories={accessories}
          previewItem={previewItem}
        >
          <CategoryOrbs activeCategory={activeCategory} onCategorySelect={handleCategorySelect} />
          {activeCategory && (
            <ClothingCarousel
              activeCategory={activeCategory}
              items={activeItems}
              selectedItemId={selectedByCategory[activeCategory]}
              onPreviewChange={setPreviewItem}
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
    paddingBottom: 24
  },
  header: {
    paddingTop: 8
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15
  },
});
