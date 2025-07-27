// ---------------------------------------------------
// FILE: AdComponents.jsx (Create this new file)
// This file will contain reusable AdMob components
// ---------------------------------------------------

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Platform, Alert } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  RewardedInterstitialAd,
  RewardedInterstitialAdEventType,
  InterstitialAd,
  AdEventType,
  AppOpenAd,
  AppOpenAdEventType,
} from 'react-native-google-mobile-ads';
import * as Application from 'expo-application';
import * as Linking from 'expo-linking';
import { useGlobalContext } from '../context/GlobalProvider'; // Assuming you have this context for user premium status
import { useTranslation } from 'react-i18next'; // For translation

// --- IMPORTANT: Replace with your actual AdMob Ad Unit IDs ---
// For testing, you can use TestIds, but replace them with your real ones from AdMob for production.
// Create these in your AdMob account: https://admob.google.com/
const bannerAdUnitId = Platform.select({
  ios: TestIds.BANNER, // Replace with your iOS Banner Ad Unit ID
  android: TestIds.BANNER, // Replace with your Android Banner Ad Unit ID
});

const rewardedAdUnitId = Platform.select({
  ios: TestIds.REWARDED_INTERSTITIAL, // Replace with your iOS Rewarded Interstitial Ad Unit ID
  android: TestIds.REWARDED_INTERSTITIAL, // Replace with your Android Rewarded Interstitial Ad Unit ID
});

// For App Tracking Transparency (ATT) on iOS, you'll need a separate library
// import * as ATTrackingManager from 'expo-tracking-transparency'; // This module is deprecated.
// The recommended way is to use a custom native module or a library like react-native-tracking-transparency
// For this example, we'll use a placeholder for ATT consent.

// Function to request ATT consent (iOS only)
const requestTrackingPermission = async () => {
  if (Platform.OS === 'ios') {
    // This is a placeholder. In a real app, you would use a library like
    // 'react-native-tracking-transparency' or a custom native module.
    // For now, we'll simulate consent.
    console.log("Simulating ATT consent request for iOS...");
    // In a real app:
    // const { status } = await ATTrackingManager.requestTrackingPermissionsAsync();
    // if (status === 'granted') {
    //   console.log('ATT granted');
    // } else {
    //   console.log('ATT denied');
    // }
    return true; // Assume granted for this example
  }
  return true; // Not applicable for Android
};

// --- Banner Ad Component ---
export const AppBannerAd = () => {
  const { user } = useGlobalContext(); // Get user from global context
  const { t } = useTranslation();

  // Don't show ads if user is premium
  if (user?.isPremium) {
    return null;
  }

  return (
    <View className="items-center justify-center p-2 mt-4 bg-white rounded-lg shadow-md">
      <Text className="text-gray-500 text-xs mb-1">{t("ads.sponsored")}</Text>
      <BannerAd
        unitId={bannerAdUnitId}
        size={BannerAdSize.BANNER} // You can try other sizes like MEDIUM_RECTANGLE
        onAdLoaded={() => {
          console.log('Banner Ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.error('Banner Ad failed to load:', error);
        }}
        onAdOpened={() => {
          console.log('Banner Ad opened');
        }}
        onAdClosed={() => {
          console.log('Banner Ad closed');
        }}
        onAdPress={() => {
          console.log('Banner Ad pressed');
        }}
      />
    </View>
  );
};

// --- Rewarded Interstitial Ad Component (for consumption-based rewards) ---
// This component is designed to be called when a user needs a reward (e.g., extra upload)
export const AppRewardedAd = ({ onRewardEarned }) => {
  const { user } = useGlobalContext();
  const { t } = useTranslation();
  const [rewardedAd, setRewardedAd] = useState(null);
  const [adLoading, setAdLoading] = useState(false);

  // Don't prepare ad if user is premium
  if (user?.isPremium) {
    return null;
  }

  // Load the rewarded ad
  useEffect(() => {
    // Request ATT consent before loading ads on iOS
    requestTrackingPermission().then(() => {
      const ad = RewardedInterstitialAd.createForAdRequest(rewardedAdUnitId, {
        requestNonPersonalizedAdsOnly: false, // Set to true if ATT consent is denied
      });

      const unsubscribeLoaded = ad.addAdEventListener(
        RewardedInterstitialAdEventType.LOADED,
        () => {
          setRewardedAd(ad);
          setAdLoading(false);
          console.log('Rewarded Ad loaded successfully');
        }
      );

      const unsubscribeEarned = ad.addAdEventListener(
        RewardedInterstitialAdEventType.EARNED_REWARD,
        (reward) => {
          console.log('User earned reward:', reward);
          if (onRewardEarned) {
            onRewardEarned(reward); // Callback to parent component to grant reward
          }
        }
      );

      const unsubscribeClosed = ad.addAdEventListener(
        RewardedInterstitialAdEventType.CLOSED,
        () => {
          console.log('Rewarded Ad closed');
          setRewardedAd(null); // Reset ad after it's closed
          setAdLoading(false);
          // Pre-load the next ad immediately after one is closed
          loadRewardedAd();
        }
      );

      const unsubscribeFailed = ad.addAdEventListener(
        RewardedInterstitialAdEventType.ERROR,
        (error) => {
          console.error('Rewarded Ad failed to load or show:', error);
          setAdLoading(false);
          Alert.alert(t("ads.adErrorTitle"), t("ads.adErrorMessage"));
          setRewardedAd(null); // Reset ad on error
          // Attempt to load a new ad
          loadRewardedAd();
        }
      );

      const loadRewardedAd = () => {
        if (!adLoading && !rewardedAd) { // Only load if not already loading or loaded
          setAdLoading(true);
          ad.load();
        }
      };

      loadRewardedAd(); // Initial load

      return () => {
        unsubscribeLoaded();
        unsubscribeEarned();
        unsubscribeClosed();
        unsubscribeFailed();
      };
    });
  }, [onRewardEarned, user?.isPremium]); // Re-run if onRewardEarned or premium status changes

  const showRewardedAd = () => {
    if (rewardedAd) {
      rewardedAd.show();
    } else if (adLoading) {
      Alert.alert(t("ads.adLoadingTitle"), t("ads.adLoadingMessage"));
    } else {
      Alert.alert(t("ads.adNotReadyTitle"), t("ads.adNotReadyMessage"));
      // Attempt to reload if not ready
      setAdLoading(true);
      RewardedInterstitialAd.createForAdRequest(rewardedAdUnitId, {}).load();
    }
  };

  return { showRewardedAd, adLoading }; // Return a function to show the ad and its loading status
};

// ---------------------------------------------------
// FILE: app.config.js (Update this file)
// Add the config plugin for react-native-google-mobile-ads
// ---------------------------------------------------
// Inside your app.config.js, add the plugin:
// plugins: [
//   // ... other plugins
//   [
//     'react-native-google-mobile-ads',
//     {
//       // IMPORTANT: Replace with your actual AdMob App ID
//       // Find this in your AdMob account under "App settings" for your app
//       // It looks like ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
//       android_app_id: 'ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy',
//       ios_app_id: 'ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy',
//     },
//   ],
// ],

// ---------------------------------------------------
// FILE: package.json (Add this dependency)
// ---------------------------------------------------
// Add this to your dependencies:
// "react-native-google-mobile-ads": "^12.0.0", // Use the latest stable version

// ---------------------------------------------------
// FILE: Home.jsx (Example of how to use the ads)
// ---------------------------------------------------
/*
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useGlobalContext } from '../context/GlobalProvider';
import { useTranslation } from 'react-i18next';
import { getFontClassName } from '../utils/fontUtils';
import GradientBackground from '../components/GradientBackground';
import { AppBannerAd, AppRewardedAd } from '../components/AdComponents'; // Import your ad components

const Home = () => {
  const { user } = useGlobalContext();
  const { t } = useTranslation();

  // Initialize the rewarded ad hook
  const { showRewardedAd, adLoading } = AppRewardedAd({
    onRewardEarned: (reward) => {
      // Logic to grant the user their reward (e.g., +1 receipt upload, +1 budget)
      Alert.alert("Reward Earned!", `You earned ${reward.amount} ${reward.type}. Enjoy your bonus!`);
      // You would update your user's limits in Appwrite here
      // e.g., updateUserLimits(user.$id, { uploads: user.uploads + 1 });
    }
  });

  const handleEarnExtraUpload = () => {
    if (!user?.isPremium) { // Only show ad for non-premium users
      showRewardedAd();
    } else {
      Alert.alert("Premium User", "You already have unlimited uploads!");
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
          {/* Header and existing Home screen content }
          <View className="flex-row items-center justify-between mb-8 mt-4">
            <Text className="text-3xl text-black" style={{ fontFamily: getFontClassName('bold') }}>
              {t('home.greeting', { name: user?.name || 'User' })}
            </Text>
            {/* ... other header icons like notifications, settings }
          </View>

          {/* ... existing Home screen content like financial advice, limits, receipts }

          {/* Example of a button to trigger rewarded ad for extra upload }
          {!user?.isPremium && (
            <TouchableOpacity
              onPress={handleEarnExtraUpload}
              className="bg-purple-600 p-3 rounded-lg mt-6 items-center justify-center shadow-md"
              disabled={adLoading}
            >
              <Text className="text-white text-lg font-bold">
                {adLoading ? t("ads.loadingAd") : t("ads.earnExtraUpload")}
              </Text>
            </TouchableOpacity>
          )}

          {/* Banner Ad at the bottom of the screen for non-premium users }
          <AppBannerAd />

        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default Home;
*/

// ---------------------------------------------------
// FILE: i18n/en.json (Add new translation keys)
// ---------------------------------------------------
/*
{
  "
}
*/

// ---------------------------------------------------
// FILE: i18n/ar.json (Add new translation keys)
// ---------------------------------------------------
/*
{
  
}
*/
