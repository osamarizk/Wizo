import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, countUnreadNotifications } from "../lib/appwrite";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0); // Track unread notifications count

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res) {
          setIsLogged(true);
          setUser(res);
          // Fetch unread notifications count when user is logged in
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
      const count = await countUnreadNotifications(userId); // Use your function
      setUnreadCount(count); // Update unreadCount state
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
    }
  };

  // Method to update unread count (can be used after creating a new notification)
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
        unreadCount, // Provide unreadCount in context
        updateUnreadCount, // Method to update unreadCount
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
