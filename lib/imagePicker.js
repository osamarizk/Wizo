import * as ImagePicker from "expo-image-picker";
export const pickImageFromCamera = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    alert("Camera permission is required!");
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    quality: 1,
  });

  if (!result.canceled) {
    return result.assets[0].uri; // the image URI
  }
  return null;
};

export const pickImageFromGallery = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    alert("Gallery permission is required!");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    quality: 1,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
  return null;
};
