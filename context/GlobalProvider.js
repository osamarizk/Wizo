// context/GlobalProvider.js

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n, { setI18nConfig } from "../utils/i18n";
import { Alert, Platform } from "react-native";
import RNRestart from "react-native-restart";
import {
  getCurrentUser,
  countUnreadNotifications,
  chkBudgetInitialization,
  getApplicationSettings,
} from "../lib/appwrite";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [hasBudget, setHasBudget] = useState(false);
  const [applicationSettings, setApplicationSettings] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isLanguageInitialized, setIsLanguageInitialized] = useState(false);
  const [dailyFreeRequests, setDailyFreeRequests] = useState(0);

  const fetchUnreadCount = async (userId) => {
    try {
      const count = await countUnreadNotifications(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
    }
  };

  const checkBudgetInitialization = useCallback(async (userId) => {
    try {
      const isInitialized = await chkBudgetInitialization(userId);
      setHasBudget(isInitialized);
      return isInitialized;
    } catch (error) {
      console.error("Error checking budget initialization", error);
      return false;
    }
  }, []);

  const loadDailyRequestState = useCallback(async () => {
    const today = new Date().toDateString(); // Get today's date string (e.g., "Mon Jun 30 2025")
    const storedLastAdviceDate = await AsyncStorage.getItem("lastAdviceDate");
    const storedDailyFreeRequests = await AsyncStorage.getItem(
      "dailyFreeRequests"
    );

    console.log("GlobalProvider: Loading daily request state...");
    console.log("  Today:", today);
    console.log("  Stored Last Advice Date:", storedLastAdviceDate);
    console.log("  Stored Daily Free Requests:", storedDailyFreeRequests);

    if (storedLastAdviceDate !== today) {
      // It's a new day, reset count to 0
      console.log(
        "GlobalProvider: New day detected. Resetting dailyFreeRequests to 0."
      );
      await AsyncStorage.setItem("lastAdviceDate", today);
      await AsyncStorage.setItem("dailyFreeRequests", "0");
      setDailyFreeRequests(0);
    } else {
      // Same day, load existing count
      const count = parseInt(storedDailyFreeRequests || "0", 10);
      console.log(
        "GlobalProvider: Same day. Loading existing dailyFreeRequests:",
        count
      );
      setDailyFreeRequests(count);
    }
  }, []);
  const checkSessionAndFetchUser = useCallback(async () => {
    setGlobalLoading(true);
    try {
      const res = await getCurrentUser();
      if (res) {
        setIsLogged(true);
        setUser(res);
        fetchUnreadCount(res.$id);
        await checkBudgetInitialization(res.$id);
      } else {
        setIsLogged(false);
        setUser(null);
        setUnreadCount(0);
        setHasBudget(false);
      }
    } catch (error) {
      console.error("Error in checkSessionAndFetchUser:", error);
      setIsLogged(false);
      setUser(null);
    } finally {
      setGlobalLoading(false);
    }
  }, [fetchUnreadCount, checkBudgetInitialization]);

  const fetchApplicationGlobalSettings = useCallback(async () => {
    try {
      const settings = await getApplicationSettings();
      setApplicationSettings(settings);
      console.log("Global Application Settings fetched:", settings);
    } catch (error) {
      console.error("Error fetching global application settings:", error);
    }
  }, []);

  const changeLanguage = useCallback(
    async (lang) => {
      if (lang === currentLanguage) return;

      try {
        await AsyncStorage.setItem("userLanguage", lang);
        setI18nConfig(lang); // This updates i18next and I18nManager
        setCurrentLanguage(lang); // Update global state

        // NEW: More explicit message for restart
        Alert.alert(
          i18n.t("common.languageChangeTitle"), // New translation key for title
          i18n.t("common.languageChangeMessage", {
            // New translation key for message
            lang:
              lang === "en"
                ? i18n.t("settings.english")
                : i18n.t("settings.arabic"),
          }),
          [
            {
              text: i18n.t("common.ok"),
              onPress: () => {
                if (Platform.OS === "web") {
                  window.location.reload(); // Web can reload directly
                } else {
                  // For native, users MUST manually close and reopen the app
                  // Or use a library like react-native-restart if installed
                  console.log(
                    "Please close the app completely and reopen it for RTL changes to take full effect."
                  );
                  // Example with react-native-restart (if installed):
                  // import RNRestart from 'react-native-restart';
                  // RNRestart.Restart();
                }
              },
            },
          ]
        );
      } catch (error) {
        console.error("Failed to change language:", error);
        Alert.alert(
          i18n.t("common.error"),
          i18n.t("common.somethingWentWrong")
        );
      }
    },
    [currentLanguage]
  );

  useEffect(() => {
    const initializeAppData = async () => {
      setLoading(true);
      try {
        const storedLanguage = await AsyncStorage.getItem("userLanguage");
        setI18nConfig(storedLanguage || i18n.language);
        setCurrentLanguage(i18n.language);
        setIsLanguageInitialized(true);

        await fetchApplicationGlobalSettings();
        await checkSessionAndFetchUser();
        await loadDailyRequestState();
      } catch (error) {
        console.error("Error initializing app data in GlobalProvider:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAppData();
  }, [loadDailyRequestState]);

  const updateUnreadCount = (count) => {
    setUnreadCount(count);
  };

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        loading,
        globalLoading,
        unreadCount,
        updateUnreadCount,
        showUploadModal,
        setShowUploadModal,
        hasBudget,
        setHasBudget,
        checkBudgetInitialization,
        checkSessionAndFetchUser,
        applicationSettings,
        currentLanguage,
        changeLanguage,
        dailyFreeRequests,
        setDailyFreeRequests,
        loadDailyRequestState,
      }}
    >
      {isLanguageInitialized ? children : null}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
