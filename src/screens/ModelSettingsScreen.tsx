import { Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View, useColorScheme } from "react-native";
import { useState } from "react";

import { AppText } from "../components/AppText";
import { PlaceholderVisual } from "../components/PlaceholderVisual";
import { PrimaryButton, buttonRowStyles } from "../components/PrimaryButton";
import { SavedModelsSection } from "../components/SavedModelsSection";
import { ScreenScaffold } from "../components/ScreenScaffold";
import { colors } from "../theme/colors";
import { sharedStyles } from "../theme/styles";
import { useClosetStore } from "../store/useClosetStore";
import { removeBackgroundLocally } from "../services/backgroundRemovalClient";
import { pickImageFromLibrary } from "../utils/imagePicker";

export function ModelSettingsScreen() {
  const scheme = useColorScheme();
  const customModelUri = useClosetStore((state) => state.customModelUri);
  const models = useClosetStore((state) => state.models);
  const activeModelId = useClosetStore((state) => state.activeModelId);
  const saveModelToStore = useClosetStore((state) => state.saveModel);
  const deleteModel = useClosetStore((state) => state.deleteModel);
  const setActiveModel = useClosetStore((state) => state.setActiveModel);
  const outfits = useClosetStore((state) => state.outfits);
  const [draftModelUri, setDraftModelUri] = useState<string>();
  const [draftModelName, setDraftModelName] = useState("");
  const [useNow, setUseNow] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const isDark = scheme === "dark";
  const previewUri = draftModelUri ?? customModelUri;

  const chooseModel = async () => {
    setStatus("idle");
    setStatusMessage("");
    const image = await pickImageFromLibrary();
    if (image) setDraftModelUri(image.dataUrl);
  };

  const removeModelBackground = async () => {
    if (!previewUri) {
      setStatus("error");
      setStatusMessage("Upload a model image first.");
      return;
    }

    setStatus("loading");
    setStatusMessage("Removing model background locally...");

    try {
      const result = await removeBackgroundLocally(previewUri);
      setDraftModelUri(result.dataUrl);
      setStatus("success");
      setStatusMessage("Background removed. Save the model to use it.");
    } catch (error) {
      setStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Local background removal failed.");
    }
  };

  const saveModel = () => {
    if (!draftModelUri) {
      setStatus("error");
      setStatusMessage("Upload or process a model image before saving.");
      return;
    }

    const modelNumber = models.length + 1;
    saveModelToStore({
      name: draftModelName.trim() || `Model ${modelNumber}`,
      imageDataUrl: draftModelUri,
      imageUrl: draftModelUri,
      isActive: models.length === 0 || useNow
    });
    setDraftModelUri(undefined);
    setDraftModelName("");
    setUseNow(true);
    setStatus("success");
    setStatusMessage("Model saved locally.");
  };

  const clearDraft = () => {
    Alert.alert("Clear draft?", "The unsaved model preview will be removed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          setDraftModelUri(undefined);
          setDraftModelName("");
          setStatus("idle");
          setStatusMessage("");
        }
      }
    ]);
  };

  return (
    <ScreenScaffold>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppText style={sharedStyles.title}>Model</AppText>
          <AppText muted style={styles.subtitle}>
            Choose the portrait for the fitting room.
          </AppText>
        </View>

        <View
          style={[
            styles.modelPreview,
            {
              backgroundColor: isDark ? colors.surfaceDark : colors.surface,
              borderColor: isDark ? colors.borderDark : colors.border
            }
          ]}
        >
          {previewUri ? (
            <Image source={{ uri: previewUri }} resizeMode="contain" style={styles.image} />
          ) : (
            <PlaceholderVisual category="model" />
          )}
        </View>

        <View style={buttonRowStyles.row}>
          <PrimaryButton title="Upload Model" onPress={chooseModel} style={buttonRowStyles.grow} />
          <PrimaryButton
            title="Clear Draft"
            variant="ghost"
            onPress={clearDraft}
            disabled={!draftModelUri}
            style={buttonRowStyles.grow}
          />
        </View>

        {draftModelUri && (
          <View style={styles.field}>
            <AppText style={sharedStyles.label}>Model Name</AppText>
            <TextInput
              value={draftModelName}
              onChangeText={setDraftModelName}
              placeholder={`Model ${models.length + 1}`}
              placeholderTextColor="#5F4D72"
              style={[
                sharedStyles.input,
                {
                  color: "#12091F",
                  backgroundColor: colors.surface,
                  borderColor: isDark ? colors.borderDark : colors.border
                }
              ]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ checked: useNow }}
              onPress={() => setUseNow((current) => !current)}
              style={[
                styles.useNowToggle,
                {
                  borderColor: useNow ? colors.accentSoft : isDark ? colors.borderDark : colors.border,
                  backgroundColor: useNow ? "rgba(242, 201, 76, 0.26)" : isDark ? colors.surfaceDark : colors.surface
                }
              ]}
            >
              <AppText style={styles.useNowText}>{useNow ? "Selected" : "Not selected"}: Use this model now</AppText>
            </Pressable>
          </View>
        )}

        <View style={buttonRowStyles.row}>
          <PrimaryButton
            title={status === "loading" ? "Removing..." : "Remove Background"}
            onPress={removeModelBackground}
            disabled={!previewUri || status === "loading"}
            style={buttonRowStyles.grow}
          />
          <PrimaryButton
            title="Save Model"
            variant="ghost"
            onPress={saveModel}
            disabled={!draftModelUri}
            style={buttonRowStyles.grow}
          />
        </View>

        {!!statusMessage && (
          <AppText
            style={[
              styles.statusText,
              status === "error" && { color: colors.danger },
              status === "success" && { color: isDark ? colors.accentSoft : colors.text }
            ]}
          >
            {statusMessage}
          </AppText>
        )}

        <SavedModelsSection
          models={models}
          activeModelId={activeModelId}
          onUseModel={setActiveModel}
          onDeleteModel={deleteModel}
        />

        <View
          style={[
            sharedStyles.card,
            {
              backgroundColor: isDark ? colors.surfaceDark : colors.surface,
              borderColor: isDark ? colors.borderDark : colors.border
            }
          ]}
        >
          <AppText style={sharedStyles.sectionTitle}>Saved outfits</AppText>
          <AppText muted style={styles.savedCount}>
            {outfits.length} saved locally
          </AppText>
          {outfits.slice(0, 5).map((outfit) => (
            <View key={outfit.id} style={styles.outfitRow}>
              <AppText style={styles.outfitName}>{outfit.name}</AppText>
              <AppText muted style={styles.outfitDate}>
                {new Date(outfit.createdAt).toLocaleDateString()}
              </AppText>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingBottom: 24
  },
  header: {
    paddingTop: 8
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15
  },
  modelPreview: {
    height: 430,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden"
  },
  image: {
    width: "100%",
    height: "100%"
  },
  savedCount: {
    marginTop: 4
  },
  field: {
    gap: 8
  },
  useNowToggle: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12
  },
  useNowText: {
    fontWeight: "900"
  },
  statusText: {
    fontSize: 13,
    fontWeight: "900"
  },
  outfitRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  outfitName: {
    flex: 1,
    fontWeight: "800"
  },
  outfitDate: {
    fontSize: 13
  }
});
