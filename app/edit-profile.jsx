// app/profile/edit.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  I18nManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useNavigation } from "expo-router";
import * as ImagePicker from "expo-image-picker";
// import { ID } from "appwrite"; // For unique file IDs in Appwrite Storage

import { useGlobalContext } from "../context/GlobalProvider";
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils";
import i18n from "../utils/i18n";
import GradientBackground from "../components/GradientBackground";
import icons from "../constants/icons";

// --- Appwrite Functions for Profile Editing ---
// Ensure these functions are correctly exported from your appwrite.js
import {
  account,
  getAppwriteErrorMessageKey, // Utility for error messages
  uploadAvatar, // Newly added dedicated function
  getAvatarDownloadUrl, // Newly added dedicated function
  saveUserPreferences, // Function to update user's document in userCollectionId
} from "../lib/appwrite";

// Helper for Arabic Numerals (copy from your existing utils if not globally available)
const convertToArabicNumerals = (num) => {
  const numString = String(num || 0);
  if (typeof numString !== "string") return String(numString);
  const arabicNumeralsMap = {
    0: "٠",
    1: "١",
    2: "٢",
    3: "٣",
    4: "٤",
    5: "٥",
    6: "٦",
    7: "٧",
    8: "٨",
    9: "٩",
  };
  return numString.replace(/\d/g, (digit) => arabicNumeralsMap[digit] || digit);
};

const EditProfile = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const {
    user,
    setUser, // To update the global user object after save
    isLoading: globalLoading,
    preferredCurrencyCode, // Current preferred currency from global context
    setPreferredCurrencyCode, // To update global context if currency changes
    setPreferredCurrencySymbol, // To update global context if currency changes
    getCurrencySymbolFromCode, // To get the symbol for the selected code
  } = useGlobalContext();

  // --- State for form fields ---
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // For password changes
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(null); // For currency dropdown
  const [avatarUri, setAvatarUri] = useState(null); // URI for the displayed avatar (local cache or Appwrite URL)
  const [newAvatarFile, setNewAvatarFile] = useState(null); // File object for new upload (uri, name, mimeType)

  // --- State for UI feedback ---
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false); // Track if any changes were made

  // --- Initialize form fields with current user data ---
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setSelectedCurrencyCode(
        user.currencyPreference || preferredCurrencyCode || "USD"
      ); // Use user's preference, then global, then default
      // If user.avatar is a file ID, get the download URL. Otherwise, it might be an initials URL or null.
      if (
        user.avatar &&
        user.avatar.length === 36 &&
        user.avatar.includes("-")
      ) {
        // Basic check for Appwrite file ID format
        getAvatarDownloadUrl(user.avatar)
          .then((url) => setAvatarUri(url))
          .catch((err) => {
            console.error("Failed to get avatar download URL:", err);
            setAvatarUri(null); // Fallback to default icon
          });
      } else {
        setAvatarUri(user.avatar || null); // Directly use if it's already a URL or null
      }
      setError(null);
      setHasChanges(false); // Reset changes on initial load
    }
  }, [user, preferredCurrencyCode]); // Re-run when global user object or preferredCurrencyCode changes

  // --- Track changes to enable/disable save button ---
  useEffect(() => {
    if (!user) return;

    const usernameChanged = username !== (user.username || "");
    const emailChanged = email !== (user.email || ""); // This field is editable=false, so this check is mostly for initial state
    const currencyChanged =
      selectedCurrencyCode !==
      (user.currencyPreference || preferredCurrencyCode || "USD");
    const passwordChanged = newPassword.length > 0; // Any length means user tried to change password
    const avatarChanged = newAvatarFile !== null;

    setHasChanges(
      usernameChanged ||
        emailChanged ||
        currencyChanged ||
        passwordChanged ||
        avatarChanged
    );
  }, [
    username,
    email,
    selectedCurrencyCode,
    newPassword,
    newAvatarFile,
    user,
    preferredCurrencyCode,
  ]);

  // --- Function to handle choosing a new avatar ---
  const handleChooseAvatar = useCallback(async () => {
    setError(null); // Clear previous errors
    let result;
    try {
      // Request media library permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("editProfile.permissionDeniedTitle"),
          t("editProfile.permissionDeniedMessage")
        );
        return;
      }

      // Launch image picker
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // Allow user to crop/edit
        aspect: [1, 1], // Force square aspect ratio for avatars
        quality: 0.7, // Compress image quality
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setAvatarUri(selectedAsset.uri); // Update displayed image immediately
        setNewAvatarFile({
          // Store file details for upload
          uri: selectedAsset.uri,
          name:
            selectedAsset.fileName || `avatar-${user.$id}-${Date.now()}.jpg`, // Fallback name
          mimeType: selectedAsset.mimeType || "image/jpeg", // Fallback mimeType
        });
        // setHasChanges(true); // This will be handled by the useEffect above
      }
    } catch (pickerError) {
      console.error("Error picking image:", pickerError);
      setError(
        t("editProfile.imagePickerError", {
          message: pickerError.message || t("common.unknownError"),
        })
      );
    }
  }, [user, t]);

  // --- Function to handle saving all changes ---
  // --- Function to handle saving all changes ---
  const handleSaveChanges = useCallback(async () => {
    setError(null);
    if (!user?.$id) {
      setError(t("common.notLoggedIn"));
      return;
    }
    if (!hasChanges) {
      Alert.alert(t("common.infoTitle"), t("editProfile.noChangesMade"));
      return;
    }

    // Password validation
    if (newPassword.length > 0) {
      if (newPassword.length < 8) {
        setError(t("editProfile.passwordTooShort"));
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError(t("editProfile.passwordsDoNotMatch"));
        return;
      }
      if (!currentPassword) {
        setError(t("editProfile.currentPasswordRequired"));
        return;
      }
    }

    setIsSaving(true);

    try {
      let updatedAvatarUrl = user.avatar; // Default to current avatar URL (or initials URL)
      let newAvatarFileId = null; // To store the ID if a new file is uploaded

      // 1. Upload new avatar if selected
      if (newAvatarFile) {
        console.log("Uploading new avatar...");
        const uploadedFile = await uploadAvatar( // Uses your dedicated uploadAvatar
          newAvatarFile.uri,
          newAvatarFile.name,
          newAvatarFile.mimeType
        );
        newAvatarFileId = uploadedFile.$id; // Get the new file ID

        updatedAvatarUrl = await getAvatarDownloadUrl(newAvatarFileId); // Uses your dedicated getAvatarDownloadUrl
        console.log("Avatar uploaded, new file ID:", newAvatarFileId);
        console.log("New avatar download URL:", updatedAvatarUrl);
      }

      // 2. Update Appwrite Account (username, password)
      const accountUpdates = {};
      if (username !== (user.username || "")) {
        accountUpdates.name = username;
      }
      // Appwrite's updatePassword requires current and new password
      if (newPassword.length > 0 && currentPassword) {
        console.log("Updating password...");
        await account.updatePassword(newPassword, currentPassword); // Uses Appwrite SDK account.updatePassword
        console.log("Password updated successfully.");
        // Clear password fields after successful update
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }

      if (Object.keys(accountUpdates).length > 0) {
        console.log("Updating account details (name)...", accountUpdates);
        await account.updateName(accountUpdates.name); // Uses Appwrite SDK account.updateName
        console.log("Account name updated.");
      }

      // 3. Update User Profile Document in Database (avatar, currencyPreference)
      const userDocUpdates = {};
      // Only update avatar field if a new avatar was chosen or if the existing one needs updating
      if (newAvatarFile || (user.avatar && updatedAvatarUrl !== user.avatar)) {
        userDocUpdates.avatar = updatedAvatarUrl; // Store the URL here
      }
      if (selectedCurrencyCode !== (user.currencyPreference || preferredCurrencyCode || "USD")) {
        userDocUpdates.currencyPreference = selectedCurrencyCode;
      }

      if (Object.keys(userDocUpdates).length > 0) {
        console.log("Updating user document in database...", userDocUpdates);
        await saveUserPreferences(user.$id, userDocUpdates); // Uses your custom saveUserPreferences
        console.log("User document updated.");
      }

      // 4. Update global user context and currency symbol
      const updatedUser = {
        ...user,
        username: username,
        avatar: updatedAvatarUrl,
        currencyPreference: selectedCurrencyCode,
      };
      setUser(updatedUser);
      setPreferredCurrencyCode(selectedCurrencyCode);
      setPreferredCurrencySymbol(getCurrencySymbolFromCode(selectedCurrencyCode));

      Alert.alert(t("common.successTitle"), t("editProfile.saveSuccess"));
      router.back(); // Go back to Account page
    } catch (e) {
      const errorKey = getAppwriteErrorMessageKey(e);
      let errorMessage = t(errorKey);
      if (errorKey === "appwriteErrors.genericAppwriteError") {
        errorMessage = t(errorKey, { message: e.message });
      } else if (errorKey === "appwriteErrors.unauthorized" && newPassword.length > 0) {
        errorMessage = t("editProfile.incorrectCurrentPassword");
      }
      console.error("Error saving profile:", e);
      setError(errorMessage);
      Alert.alert(t("common.errorTitle"), errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [
    user,
    username,
    email,
    currentPassword,
    newPassword,
    confirmNewPassword,
    selectedCurrencyCode,
    newAvatarFile,
    hasChanges,
    t,
    setUser,
    setPreferredCurrencyCode,
    setPreferredCurrencySymbol,
    getCurrencySymbolFromCode,
    uploadAvatar,
    getAvatarDownloadUrl,
    saveUserPreferences,
    account,
  ]);




  // --- Loading state for the page itself ---
  if (globalLoading || !user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text
          className="text-white mt-4"
          style={{ fontFamily: getFontClassName("extralight") }}
        >
          {t("account.loadingUserData")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1 mr-4 ml-4">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.scrollViewContent}
              className="p-4"
            >
              {/* Header */}
              <View
                className={`flex-row items-center justify-between mb-8 mt-4 ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <TouchableOpacity onPress={() => router.back()} className="p-4">
                  <Text
                    className="text-blue-600 text-lg"
                    style={{ fontFamily: getFontClassName("medium") }}
                  >
                    {t("common.back")}
                  </Text>
                </TouchableOpacity>
                <Text
                  className="text-2xl text-black"
                  style={{ fontFamily: getFontClassName("bold") }}
                >
                  {t("editProfile.editProfileTitle")}
                </Text>
                <View className="w-10" />
              </View>

              {/* Error Message */}
              {error && (
                <Text
                  className="text-red-500 text-center mb-4"
                  style={{ fontFamily: getFontClassName("medium") }}
                >
                  {error}
                </Text>
              )}

              {/* Avatar Section */}
              <View className="items-center mb-8">
                <Image
                  source={avatarUri ? { uri: avatarUri } : icons.user}
                  className="w-24 h-24 rounded-full border-4 border-[#9F54B6] mb-4"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={handleChooseAvatar}
                  className="bg-[#2A9D8F] p-3 rounded-lg flex-row items-center justify-center"
                >
                  <Image
                    source={icons.camera}
                    className={`w-5 h-5 ${I18nManager.isRTL ? "ml-2" : "mr-2"}`}
                    tintColor="#FFFFFF"
                    resizeMode="contain"
                  />
                  <Text
                    className="text-white text-base"
                    style={{ fontFamily: getFontClassName("medium") }}
                  >
                    {t("editProfile.changeAvatar")}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View className="mb-6">
                {/* Username */}
                <Text
                  className={`text-base text-gray-700 mb-1 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`}
                  style={{ fontFamily: getFontClassName("medium") }}
                >
                  {t("editProfile.username")}:
                </Text>
                <TextInput
                  className={`border border-gray-300 rounded-md p-3 text-base bg-gray-50 mb-4 text-black ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`}
                  style={{ fontFamily: getFontClassName("regular") }}
                  value={username}
                  onChangeText={setUsername}
                  placeholder={t("editProfile.enterUsername")}
                  placeholderTextColor="#999"
                />

                {/* Email (usually read-only or requires re-verification) */}
                {/* <Text
                  className={`text-base text-gray-700 mb-1 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`}
                  style={{ fontFamily: getFontClassName("medium") }}
                >
                  {t("editProfile.email")}:
                </Text>
                <TextInput
                  className={`border border-gray-300 rounded-md p-3 text-base bg-gray-200 mb-4 text-black ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`}
                  style={{ fontFamily: getFontClassName("regular") }}
                  value={email}
                  editable={false} // Email is often not directly editable for security
                  placeholderTextColor="#999"
                /> */}

                {/* Currency Preference (Placeholder for now, will be a dropdown) */}
                {/* <Text
                  className={`text-base text-gray-700 mb-1 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`}
                  style={{ fontFamily: getFontClassName("medium") }}
                >
                  {t("editProfile.preferredCurrency")}:
                </Text>
                <TouchableOpacity
                  className={`border border-gray-300 rounded-md p-3 text-base bg-gray-50 mb-4 flex-row items-center justify-between ${
                    I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
                  }`}
                  onPress={() =>
                    Alert.alert(
                      "Currency Selector",
                      "Will implement currency selection here!"
                    )
                  }
                >
                  <Text
                    style={{
                      fontFamily: getFontClassName("regular"),
                      color: "#333",
                    }}
                  >
                    {selectedCurrencyCode} (
                    {getCurrencySymbolFromCode(selectedCurrencyCode)})
                  </Text>
                  <Image
                    source={icons.arrowRight}
                    className={`w-4 h-4 ${I18nManager.isRTL ? "ml-2" : "mr-2"}`}
                    tintColor="#999"
                    resizeMode="contain"
                  />
                </TouchableOpacity> */}

                {/* Password Fields */}
                <Text
                  className={`text-base text-gray-700 mb-1 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`}
                  style={{ fontFamily: getFontClassName("medium") }}
                >
                  {t("editProfile.currentPassword")}:
                </Text>
                <TextInput
                  className={`border border-gray-300 rounded-md p-3 text-base bg-gray-50 mb-4 text-black ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`}
                  style={{ fontFamily: getFontClassName("regular") }}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder={t("editProfile.enterCurrentPassword")}
                  placeholderTextColor="#999"
                  secureTextEntry
                />

                <Text
                  className={`text-base text-gray-700 mb-1 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`}
                  style={{ fontFamily: getFontClassName("medium") }}
                >
                  {t("editProfile.newPassword")}:
                </Text>
                <TextInput
                  className={`border border-gray-300 rounded-md p-3 text-base bg-gray-50 mb-4 text-black ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`}
                  style={{ fontFamily: getFontClassName("regular") }}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder={t("editProfile.enterNewPassword")}
                  placeholderTextColor="#999"
                  secureTextEntry
                />

                <Text
                  className={`text-base text-gray-700 mb-1 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`}
                  style={{ fontFamily: getFontClassName("medium") }}
                >
                  {t("editProfile.confirmNewPassword")}:
                </Text>
                <TextInput
                  className={`border border-gray-300 rounded-md p-3 text-base bg-gray-50 mb-4 text-black ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`}
                  style={{ fontFamily: getFontClassName("regular") }}
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  placeholder={t("editProfile.confirmNewPasswordPlaceholder")}
                  placeholderTextColor="#999"
                  secureTextEntry
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSaveChanges} // <-- CONNECTED to save logic
                className={`w-full bg-[#4E17B3] p-4 rounded-lg items-center justify-center ${
                  isSaving || !hasChanges ? "opacity-70" : ""
                }`}
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text
                    className="text-white text-lg"
                    style={{ fontFamily: getFontClassName("bold") }}
                  >
                    {t("editProfile.saveChanges")}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20, // Ensure content isn't cut off by keyboard
  },
});

export default EditProfile;
