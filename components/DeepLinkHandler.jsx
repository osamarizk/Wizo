import { useEffect } from "react";
import * as Linking from "expo-linking";
import { router } from "expo-router";

const DeepLinkHandler = () => {
  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      if (!url) return;
      
      const parsed = Linking.parse(url);
      console.log('Parsed Deep Link:', parsed);

      // Example: parsed = { scheme: "o7empower", path: "reset-pwd", queryParams: { userId: "...", secret: "..." } }
      if (parsed.path === "reset-pwd" && parsed.queryParams) {
        const { userId, secret } = parsed.queryParams;

        if (userId && secret) {
          // Navigate and pass params
          router.push({
            pathname: "/reset-pwd",
            params: { userId, secret },
          });
        }
      }
    };

    // Listen to incoming links
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Also handle app cold start (when app is opened by a link from killed state)
    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    })();

    return () => subscription.remove();
  }, []);

  return null; // 👈 this component has no UI
};

export default DeepLinkHandler;
