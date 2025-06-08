import React, { createContext, useContext, useEffect, useState } from "react";

import {
  getCurrentUser,
  countUnreadNotifications,
  chkBudgetInitialization,
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
  const [hasBudget, setHasBudget] = useState(false); // Add hasBudget state
  const [isBudgetInitialized, setIsBudgetInitialized] = useState(false); // <--- Add this state

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res) {
          setIsLogged(true);
          setUser(res);
          fetchUnreadCount(res.$id);
        } else {
          setIsLogged(false);
          setUser(null);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Function to fetch unread notifications count
  const fetchUnreadCount = async (userId) => {
    try {
      const count = await countUnreadNotifications(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
    }
  };

  const checkBudgetInitialization = async (userId) => {
    // Use the imported function
    setGlobalLoading(true);
    try {
      const isInitialized = await chkBudgetInitialization(userId);
      setHasBudget(isInitialized);
      return isInitialized;
    } catch (error) {
      console.error("Error checking budget initialization", error);
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  // Method to update unread count
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
        unreadCount,
        updateUnreadCount,
        showUploadModal,
        setShowUploadModal,
        checkBudgetInitialization, // Use the function in the value
        globalLoading,
        hasBudget, // Include hasBudget in the context value
        setHasBudget, // Include setHasBudget in the context value
        isBudgetInitialized, // <--- Expose it
        setIsBudgetInitialized, // <--- Expose the setter
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
