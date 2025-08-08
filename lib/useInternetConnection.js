import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

// Remember to install the library first:
// npx expo install @react-native-community/netinfo

/**
 * A custom hook to monitor the device's internet connection status.
 * It returns a boolean indicating whether the device is currently connected.
 *
 * @returns {boolean | null} The connection status (true/false), or null while checking.
 */
const useInternetConnection = () => {
  const [isConnected, setIsConnected] = useState(null);

  useEffect(() => {
    // Subscribe to network state changes when the component mounts
    const unsubscribe = NetInfo.addEventListener((state) => {
      // We use state.isConnected which is a simple boolean for reachability.
      // state.isInternetReachable is a more robust check for a network endpoint.
      // Both are good options depending on your needs.
      setIsConnected(state.isConnected);
    });

    // Clean up the subscription when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  return isConnected;
};

export default useInternetConnection;
