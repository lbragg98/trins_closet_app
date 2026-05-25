import * as ImagePicker from "expo-image-picker";

export async function pickImageFromLibrary() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return undefined;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 1,
    base64: true
  });

  if (result.canceled) return undefined;
  const asset = result.assets[0];
  if (!asset) return undefined;

  const mimeType = asset.mimeType ?? "image/png";
  const dataUrl = asset.base64 ? `data:${mimeType};base64,${asset.base64}` : asset.uri;

  return {
    uri: asset.uri,
    dataUrl,
    mimeType
  };
}
