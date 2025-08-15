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

const currencySymbolsMap = {
  USD: { en: "$", ar: "$" },
  EUR: { en: "€", ar: "€" },
  GBP: { en: "£", ar: "£" },
  JPY: { en: "¥", ar: "¥" },
  SAR: { en: "SAR", ar: "ر.س" }, // Saudi Riyal has different English/Arabic abbreviations/symbols
  AED: { en: "AED", ar: "د.إ" }, // UAE Dirham has different English/Arabic abbreviations/symbols
  EGP: { en: "EGP", ar: "ج.م" }, // Egyptian Pound has different English/Arabic abbreviations/symbols
  CAD: { en: "C$", ar: "C$" },
  AUD: { en: "A$", ar: "A$" },
  INR: { en: "₹", ar: "₹" },
  BRL: { en: "R$", ar: "R$" },
  CHF: { en: "CHF", ar: "CHF" },
  TRY: { en: "₺", ar: "₺" },
  RUB: { en: "₽", ar: "₽" },
  // Add more as needed, ensure consistency with CurrencySelector.jsx
  // For currencies like USD, EUR, GBP where the symbol is globally recognized,
  // you can use the same symbol for both 'en' and 'ar'.
  // For currencies with distinct Arabic symbols/abbreviations, provide both.
};

const countryCodeToCurrencyMap = {
  US: { code: "USD", symbol: "$" },
  CA: { code: "CAD", symbol: "C$" },
  MX: { code: "MXN", symbol: "Mex$" },
  GB: { code: "GBP", symbol: "£" },
  DE: { code: "EUR", symbol: "€" },
  FR: { code: "EUR", symbol: "€" },
  IT: { code: "EUR", symbol: "€" },
  ES: { code: "EUR", symbol: "€" },
  RU: { code: "RUB", symbol: "₽" },
  CH: { code: "CHF", symbol: "CHF" },
  JP: { code: "JPY", symbol: "¥" },
  CN: { code: "CNY", symbol: "¥" },
  IN: { code: "INR", symbol: "₹" },
  SA: { code: "SAR", symbol: "ر.س" },
  AE: { code: "AED", symbol: "د.إ" },
  EG: { code: "EGP", symbol: "ج.م" },
  TR: { code: "TRY", symbol: "₺" },
  SG: { code: "SGD", symbol: "S$" },
  AU: { code: "AUD", symbol: "A$" },
  BR: { code: "BRL", symbol: "R$" },
  AR: { code: "ARS", symbol: "$" },
  ZA: { code: "ZAR", symbol: "R" },
  NG: { code: "NGN", symbol: "₦" },
  DEFAULT: { code: "USD", symbol: "$" },
};

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

  const [preferredCurrencyCode, setPreferredCurrencyCode] = useState(null);
  const [preferredCurrencySymbol, setPreferredCurrencySymbol] = useState("$"); // Default to dollar sign

  // --- Helper to get symbol from code ---
  const getCurrencySymbolFromCode = useCallback(
    (currencyCode) => {
      const symbols = currencySymbolsMap[currencyCode];
      if (symbols) {
        return i18n.language.startsWith("ar") ? symbols.ar : symbols.en;
      }
      return "$"; // Fallback to $ if code not found or symbols object is missing
    },
    [i18n.language]
  ); // Dependency on i18n.language to re-evaluate when language changes

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
      console.log("Global Provider: Fetched user:", res);
      if (res) {
        setIsLogged(true);
        setUser(res);
        fetchUnreadCount(res.$id);
        await checkBudgetInitialization(res.$id);

        const userPreferredCurrency = res?.currencyPreference;
        const userCountryName = res?.countryName; // Assuming countryName is also on the user object

        if (userPreferredCurrency) {
          setPreferredCurrencyCode(userPreferredCurrency);
          // --- FIXED: Use getCurrencySymbolFromCode to get the localized symbol ---
          setPreferredCurrencySymbol(
            getCurrencySymbolFromCode(userPreferredCurrency)
          );
        } else {
          const derivedCurrency =
            countryCodeToCurrencyMap[userCountryName?.toUpperCase()] ||
            countryCodeToCurrencyMap.DEFAULT;
          setPreferredCurrencyCode(derivedCurrency.code);
          // --- FIXED: Use getCurrencySymbolFromCode for fallback symbol ---
          setPreferredCurrencySymbol(
            getCurrencySymbolFromCode(derivedCurrency.code)
          );
          console.warn(
            "User preferred currency not found on user object, defaulting based on country or USD."
          );
        }
      } else {
        setIsLogged(false);
        setUser(null);
        setUnreadCount(0);
        setHasBudget(false);
        setPreferredCurrencyCode(null);
        setPreferredCurrencySymbol("$");
      }
    } catch (error) {
      console.error("Error in checkSessionAndFetchUser:", error);
      setIsLogged(false);
      setUser(null);
      setPreferredCurrencyCode(null);
      setPreferredCurrencySymbol("$");
    } finally {
      setGlobalLoading(false);
    }
  }, [fetchUnreadCount, checkBudgetInitialization, getCurrencySymbolFromCode]);

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

        if (preferredCurrencyCode) {
          setPreferredCurrencySymbol(
            getCurrencySymbolFromCode(preferredCurrencyCode)
          );
        }

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
        preferredCurrencyCode,
        setPreferredCurrencyCode,
        preferredCurrencySymbol,
        setPreferredCurrencySymbol,
        getCurrencySymbolFromCode,
      }}
    >
      {isLanguageInitialized ? children : null}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
