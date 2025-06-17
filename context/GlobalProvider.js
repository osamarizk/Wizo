import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

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
  const [loading, setLoading] = useState(true); // Initial loading for getCurrentUser
  const [globalLoading, setGlobalLoading] = useState(false); // For operations like budget check
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [hasBudget, setHasBudget] = useState(false);
  const [applicationSettings, setApplicationSettings] = useState(null);
  // Removed `isBudgetInitialized` as `hasBudget` now serves this purpose.

  // Function to fetch unread notifications count
  const fetchUnreadCount = async (userId) => {
    try {
      const count = await countUnreadNotifications(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
    }
  };

  // New function to explicitly check session and fetch user data
  const checkSessionAndFetchUser = useCallback(async () => {
    setGlobalLoading(true); // Indicate a global loading operation
    try {
      const res = await getCurrentUser();
      if (res) {
        setIsLogged(true);
        setUser(res);
        fetchUnreadCount(res.$id);
        // Also check budget initialization whenever user data is fetched
        await checkBudgetInitialization(res.$id); // Call the new function
      } else {
        setIsLogged(false);
        setUser(null);
        setUnreadCount(0); // Clear unread count if no user
        setHasBudget(false); // Clear budget status if no user
      }
    } catch (error) {
      console.error("Error in checkSessionAndFetchUser:", error);
      setIsLogged(false);
      setUser(null);
    } finally {
      setGlobalLoading(false);
    }
  }, []); // No dependencies as it manages its own loading and internal calls

  // NEW: Function to fetch global application settings
  const fetchApplicationGlobalSettings = useCallback(async () => {
    try {
      const settings = await getApplicationSettings();
      setApplicationSettings(settings);
      console.log("Global Application Settings fetched:", settings);
    } catch (error) {
      console.error("Error fetching global application settings:", error);
      // Even if fetch fails, the getApplicationSettings function returns defaults,
      // so applicationSettings won't be null.
    }
  }, []);
  useEffect(() => {
    // Initial check on component mount
    fetchApplicationGlobalSettings();
    checkSessionAndFetchUser().finally(() => {
      setLoading(false); // Mark initial loading as complete
    });
  }, [fetchApplicationGlobalSettings, checkSessionAndFetchUser]); // Dependency array to re-run only if checkSessionAndFetchUser changes (which it won't due to useCallback)

  // Function to check budget initialization status
  const checkBudgetInitialization = useCallback(async (userId) => {
    // No setGlobalLoading here, as checkSessionAndFetchUser already handles it,
    // or this can be called independently if only budget status is needed.
    try {
      const isInitialized = await chkBudgetInitialization(userId);
      setHasBudget(isInitialized);
      return isInitialized;
    } catch (error) {
      console.error("Error checking budget initialization", error);
      return false;
    }
  }, []);

  // Method to update unread count (can be called by other components)
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
        loading, // Initial app loading state
        globalLoading, // Loading state for background operations
        unreadCount,
        updateUnreadCount,
        showUploadModal,
        setShowUploadModal,
        hasBudget,
        setHasBudget,
        checkBudgetInitialization, // Expose this function for external use
        checkSessionAndFetchUser, // Expose the new function for re-fetching user data
        applicationSettings,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
