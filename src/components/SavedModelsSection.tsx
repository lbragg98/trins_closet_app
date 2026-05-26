import { Alert, Image, Platform, Pressable, StyleSheet, View, useColorScheme } from "react-native";

import { colors } from "../theme/colors";
import { sharedStyles } from "../theme/styles";
import { SavedModel } from "../types/closet";
import { AppText } from "./AppText";
import { PrimaryButton } from "./PrimaryButton";

type SavedModelsSectionProps = {
  models: SavedModel[];
  activeModelId?: string;
  onUseModel: (id: string) => void;
  onDeleteModel: (id: string) => void;
};

export function SavedModelsSection({ models, activeModelId, onUseModel, onDeleteModel }: SavedModelsSectionProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const confirmDelete = (model: SavedModel) => {
    const isActive = model.id === activeModelId;
    const message = isActive
      ? "This is your current model. Deleting it will remove it from the outfit builder."
      : `${model.name} will be removed from this device.`;

    if (Platform.OS === "web") {
      if (window.confirm(`${message}\n\nDelete this model?`)) {
        onDeleteModel(model.id);
      }
      return;
    }

    Alert.alert(
      "Delete model?",
      message,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDeleteModel(model.id) }
      ]
    );
  };

  return (
    <View
      style={[
        sharedStyles.card,
        styles.section,
        {
          backgroundColor: "rgba(35, 18, 55, 0.78)",
          borderColor: "rgba(255, 183, 240, 0.46)"
        }
      ]}
    >
      <View>
        <AppText style={sharedStyles.sectionTitle}>Saved Models</AppText>
        <AppText muted style={styles.subtitle}>
          Choose which model appears in the outfit builder.
        </AppText>
      </View>

      {models.length === 0 ? (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyTitle}>No saved models yet</AppText>
          <AppText muted style={styles.emptyText}>
            Upload a model image above to start building outfits.
          </AppText>
        </View>
      ) : (
        <View style={styles.grid}>
          {models.map((model) => {
            const isActive = model.id === activeModelId;

            return (
              <View
                key={model.id}
                style={[
                  styles.card,
                  {
                    borderColor: isActive ? colors.accentSoft : "rgba(255, 183, 240, 0.42)",
                    backgroundColor: "rgba(48, 24, 76, 0.82)"
                  }
                ]}
              >
                <View style={styles.imageWrap}>
                  <Image source={{ uri: model.imageUrl ?? model.imageDataUrl }} resizeMode="contain" style={styles.image} />
                  {isActive && (
                    <View style={styles.badge}>
                      <AppText style={styles.badgeText}>Active</AppText>
                    </View>
                  )}
                </View>
                <AppText style={styles.modelName} numberOfLines={1}>
                  {model.name}
                </AppText>
                <PrimaryButton title={isActive ? "Current Model" : "Use Model"} onPress={() => onUseModel(model.id)} disabled={isActive} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${model.name}`}
                  onPress={() => confirmDelete(model)}
                  style={styles.deleteButton}
                >
                  <AppText style={styles.deleteText}>Delete</AppText>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13
  },
  emptyState: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  emptyTitle: {
    fontWeight: "900"
  },
  emptyText: {
    textAlign: "center",
    fontSize: 13
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  card: {
    width: "47%",
    minHeight: 240,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 10,
    shadowColor: colors.neonPink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18
  },
  imageWrap: {
    height: 132,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.82)"
  },
  image: {
    width: "100%",
    height: "100%"
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.neonPink
  },
  badgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "900"
  },
  modelName: {
    fontWeight: "900"
  },
  deleteButton: {
    alignItems: "center",
    paddingVertical: 4
  },
  deleteText: {
    color: colors.danger,
    fontWeight: "900"
  }
});
