import { useEffect } from "react";
import * as Updates from "expo-updates";


export const useAppUpdates = () => {
  useEffect(() => {
    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          console.log("New update available. Fetching...");
          // Download the new update in the background
          await Updates.fetchUpdateAsync();
          console.log("Update fetched successfully. Reloading app...");
          // Reload the app to apply the new bundle
          await Updates.reloadAsync();
        } else {
          console.log("No new updates available.");
        }
      } catch (error) {
        // Handle errors, e.g., network issues
        console.error("Error fetching latest Expo update:", error);
      }
    }

    onFetchUpdateAsync();
  }, []);
};

// You would then use this hook in a top-level component, like your App.js file
// Example usage:
// import React from 'react';
// import { useAppUpdates } from './hooks/useAppUpdates';
// export default function App() {
//   useAppUpdates(); // Call the hook here
//   return (
//     // ... your main app components
//   );
// }
