import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert, // Keep Alert for general errors, but modal for badges
  LayoutAnimation,
  UIManager,
  Platform,
  Modal, // Added Modal import
  Pressable, // Added Pressable import
  StyleSheet, // Added StyleSheet import for modal styles
} from "react-native";
import { useGlobalContext } from "../../context/GlobalProvider"; // Your existing context
import GradientBackground from "../../components/GradientBackground"; // Your existing component
import { useNavigation, useFocusEffect } from "expo-router"; // Your existing navigation
import Collapsible from "react-native-collapsible"; // Your existing dependency
import icons from "../../constants/icons"; // Your existing icons

// Assuming 'date-fns' is installed for date formatting
import { format } from "date-fns"; // FIX: Corrected import syntax here

// Import your Appwrite functions from your lib file
import {
  getUserBudgets,
  chkBudgetInitialization,
  getCategories,
  getCategories2Bud, // Your new function for Budget page
  getUserPoints,
  getUserEarnedBadges,
  // getReceiptStats, // Uncomment if you re-introduce receiptStats logic
} from "../../lib/appwrite"; // Adjust this path as needed to your appwrite functions file

// Enable LayoutAnimation for smooth transitions on Android
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Budget = () => {
  const { user, isLoading: globalLoading } = useGlobalContext();
  const navigation = useNavigation();

  const [isBudgetInitialized, setIsBudgetInitialized] = useState(false);
  const [userBudgets, setUserBudgets] = useState([]);
  const [userTotalPoints, setUserTotalPoints] = useState(0);
  const [userBadges, setUserBadges] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [categoriesMap, setCategoriesMap] = useState({});

  // States for custom modal
  const [showPointsBadgeModal, setShowPointsBadgeModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  // const [receiptStats, setReceiptStats] = useState({ totalCount: 0 }); // Uncomment if you re-introduce receiptStats logic

  const showCustomModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowPointsBadgeModal(true);
  };

  const closeCustomModal = () => {
    setShowPointsBadgeModal(false);
    setModalTitle("");
    setModalMessage("");
  };

  // Function to fetch all categories and build the map
  const fetchAllCategories = useCallback(async () => {
    if (!user?.$id) return;
    try {
      // Using your new Appwrite function getCategories2Bud()
      const categories = await getCategories2Bud();
      const map = {};
      categories.forEach((cat) => {
        map[cat.$id] = cat.name;
      });
      setCategoriesMap(map);
      console.log("Fetched categories:", categories);
    } catch (error) {
      console.error("Error fetching all categories:", error);
      Alert.alert("Error", "Failed to load categories.");
    }
  }, [user?.$id]);

  const getCategoryName = (categoryId) => {
    return categoriesMap[categoryId] || "Unknown Category";
  };

  const fetchBudgetData = useCallback(async () => {
    if (!user?.$id) {
      setIsLoadingData(false);
      return;
    }

    if (!refreshing) {
      setIsLoadingData(true);
    }

    try {
      const initialized = await chkBudgetInitialization(user.$id);
      setIsBudgetInitialized(initialized);

      if (initialized) {
        const budgets = await getUserBudgets(user.$id);
        setUserBudgets(budgets);
        console.log("Fetched user budgets:", budgets);
      } else {
        setUserBudgets([]);
      }

      const userPointsDocs = await getUserPoints(user.$id);
      if (userPointsDocs && userPointsDocs.length > 0) {
        setUserTotalPoints(userPointsDocs[0].points || 0);
      } else {
        setUserTotalPoints(0);
      }
      console.log("User Total Points fetched:", userTotalPoints);

      const earnedBadges = await getUserEarnedBadges(user.$id);
      setUserBadges(earnedBadges);
      console.log("User Badges fetched:", earnedBadges);

      // if (typeof getReceiptStats === 'function') { // Uncomment if re-introducing receiptStats
      //     const stats = await getReceiptStats(user.$id);
      //     setReceiptStats(stats);
      // }

      await fetchAllCategories(); // Ensure categories are fetched before budgets
    } catch (error) {
      console.error("Error fetching budget data:", error);
      Alert.alert("Error", "Failed to load budget data.");
    } finally {
      setIsLoadingData(false);
      setRefreshing(false);
    }
  }, [user?.$id, refreshing, fetchAllCategories]);

  useFocusEffect(
    useCallback(() => {
      console.log("Budget screen focused, fetching data...");
      fetchBudgetData();
      return () => {
        setIsExpanded(false);
        closeCustomModal();
      };
    }, [fetchBudgetData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBudgetData();
  }, [fetchBudgetData]);

  const SetupBudget = () => {
    navigation.navigate("budget-set");
  };

  const ViewBudget = (budgetId) => {
    navigation.navigate("budget-dtl", { budgetId: budgetId });
  };

  const toggleExpanded = () => {
    LayoutAnimation.easeInEaseOut();
    setIsExpanded(!isExpanded);
  };

  const showBudgetPrompt = !isBudgetInitialized;

  if (isLoadingData || globalLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading your budgets...</Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Removed old pointsBadgesSection from here */}

          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>My Budgets</Text>
            <Image
              source={icons.pie} // Using pie icon for budget, adjust as needed
              style={styles.headerIcon}
              tintColor="#9F54B6"
              resizeMode="contain"
            />
          </View>

          <Text style={styles.introText}>
            Set up and manage your budgets to keep track of your spending habits
            and financial goals.
          </Text>

          {/* NEW LOCATION: Consolidated Earnings and Setup Prompt Section */}
          {(userTotalPoints > 0 ||
            userBadges.length > 0 ||
            showBudgetPrompt) && (
            <View style={styles.combinedEarningsAndPromptContainer}>
              {/* Points and Badges display (styled for earnings) */}
              {(userTotalPoints > 0 || userBadges.length > 0) && (
                <View style={styles.earningsDisplayContainer}>
                  <View style={styles.earningsItem}>
                    <Image source={icons.star} style={styles.earningsIcon} />
                    <Text style={styles.earningsText}>
                      Points:{" "}
                      <Text style={styles.earningsValue}>
                        {userTotalPoints}
                      </Text>
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      showCustomModal(
                        "Your Badges",
                        "View your earned achievements!"
                      )
                    }
                    style={styles.earningsItemButton}
                  >
                    <Image source={icons.medal} style={styles.earningsIcon} />
                    <Text style={styles.earningsText}>
                      Badges:{" "}
                      <Text style={styles.earningsValue}>
                        {userBadges.length}
                      </Text>
                    </Text>
                    <Image source={icons.arrowRight} style={styles.arrowIcon} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Setup Budget Prompt (appears if budget is not initialized) */}
              {showBudgetPrompt && (
                <View style={styles.setupBudgetPromptBelowEarnings}>
                  <TouchableOpacity
                    onPress={SetupBudget}
                    style={styles.setupBudgetButton}
                  >
                    <Text style={styles.setupBudgetButtonText}>
                      Start Your First Budget
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {userBudgets.length > 0 && (
            <View style={styles.currentBudgetsContainer}>
              <Text style={styles.currentBudgetsTitle}>
                Your Current Budgets
              </Text>

              <TouchableOpacity
                onPress={toggleExpanded}
                style={styles.toggleButton}
              >
                <Text style={styles.toggleButtonText}>
                  {isExpanded ? "Hide Budgets" : "Show My Budgets"}
                </Text>
                <Image
                  source={isExpanded ? icons.up : icons.down}
                  style={styles.toggleIcon}
                  tintColor="#333"
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <Collapsible collapsed={!isExpanded}>
                {isExpanded && (
                  <View style={styles.budgetList}>
                    {userBudgets.map((budget) => (
                      <TouchableOpacity
                        key={budget.$id}
                        onPress={() => ViewBudget(budget.$id)}
                        style={styles.budgetCard}
                      >
                        <Text style={styles.budgetCardTitle}>
                          📊 Budget for {getCategoryName(budget.categoryId)}
                        </Text>
                        <Text style={styles.budgetCardAmount}>
                          🎯 Amount: $
                          {parseFloat(budget.budgetAmount).toFixed(2)}
                        </Text>
                        <Text style={styles.budgetCardDates}>
                          {format(new Date(budget.startDate), "MMM dd,yyyy")} -{" "}
                          {format(new Date(budget.endDate), "MMM dd,yyyy")}
                        </Text>
                        <Text style={styles.budgetCardDetailsButton}>
                          View Details
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Collapsible>

              <TouchableOpacity
                onPress={SetupBudget}
                style={styles.addNewBudgetButton}
              >
                <Text style={styles.addNewBudgetButtonText}>
                  Add New Budget
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Fallback prompt if no budgets and no points/badges to display */}
          {/* {!(userTotalPoints > 0 || userBadges.length > 0) &&
            userBudgets.length === 0 &&
            !isLoadingData && (
              <View style={styles.noBudgetsContainer}>
                <Text style={styles.noBudgetsText}>No budgets set up yet.</Text>
                <TouchableOpacity
                  onPress={SetupBudget}
                  style={styles.setupFirstBudgetButton}
                >
                  <Text style={styles.setupFirstBudgetButtonText}>
                    Start Your First Budget
                  </Text>
                </TouchableOpacity>
              </View>
            )} */}

          {/* Spacer at the bottom */}
          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>

      {/* Custom Modal for Points/Badges */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showPointsBadgeModal}
        onRequestClose={closeCustomModal}
      >
        <Pressable style={styles.centeredView} onPress={closeCustomModal}>
          <View style={styles.modalView} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            {modalTitle === "Your Badges" && (
              <ScrollView style={styles.badgeList}>
                {userBadges.length > 0 ? (
                  userBadges.map((badge, index) => (
                    <View key={index} style={styles.badgeItem}>
                      <Text style={styles.badgeName}>
                        • {badge.name || "Unnamed Badge"}
                        {badge.points ? ` (${badge.points} pts)` : ""}
                      </Text>
                      <Text style={styles.badgeDescription}>
                        {badge.description || "No description provided."}
                        {badge.earnedAt
                          ? ` (Earned on: ${format(
                              new Date(badge.earnedAt),
                              "MMM dd,yyyy"
                            )})`
                          : ""}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noBadgesText}>
                    No badges earned yet. Keep using the app!
                  </Text>
                )}
              </ScrollView>
            )}
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={closeCustomModal}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 16,
    fontFamily: "pextralight", // Assuming these font families are defined in your project
    fontSize: 18,
  },
  safeArea: {
    flex: 1,
  },
  scrollViewContent: {
    width: "100%",
    height: "100%",
    padding: 16,
  },
  // Removed old pointsBadgesSection styles
  pointsContainer: {
    // Keeping these styles in case they are used elsewhere, though the direct `pointsBadgesSection` is removed.
    marginTop: 4,
    flex: 1,
  },
  pointsText: {
    color: "#6b7280",
    fontFamily: "pmedium",
    fontSize: 18,
  },
  pointsValue: {
    fontFamily: "pbold",
    fontSize: 20,
  },
  viewBadgesButton: {
    marginTop: 8,
  },
  viewBadgesText: {
    color: "#6b7280",
    fontFamily: "psemibold",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  setupBudgetPromptContainer: {
    // Keeping this style, but its usage shifts
    marginLeft: 16,
    padding: 8,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0)",
    alignItems: "flex-start",
    flex: 1,
  },
  setupBudgetButton: {
    marginBottom: 8,
    width: "100%",
    backgroundColor: "#D03957",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  setupBudgetButtonText: {
    color: "#FFFFFF",
    fontFamily: "pmedium",
    fontSize: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "pbold",
    color: "#000000",
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  introText: {
    fontSize: 14,
    fontFamily: "pregular",
    color: "#4b5563",
    textAlign: "left",
    marginBottom: 16,
    marginTop: 8,
  },
  // Styles for the combined earnings and prompt container
  combinedEarningsAndPromptContainer: {
    marginBottom: 20, // Add spacing below this entire section
    paddingHorizontal: 5, // Small padding for the whole block
  },
  earningsDisplayContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#f0f9ff", // light blue background
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 10, // Added spacing between earnings and prompt
    borderWidth: 1,
    borderColor: "#bfdbfe", // blue-200
    elevation: 2, // subtle shadow for Android
    shadowColor: "#000", // subtle shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  earningsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  earningsItemButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#e0f2fe", // slightly darker blue on hover/press
    borderRadius: 8,
    paddingVertical: 8,
    marginLeft: 10,
  },
  earningsIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    tintColor: "#2563eb", // blue-600
  },
  arrowIcon: {
    width: 16,
    height: 16,
    marginLeft: 8,
    tintColor: "#2563eb",
  },
  earningsText: {
    fontSize: 16,
    fontFamily: "pmedium",
    color: "#1e40af", // blue-800
  },
  earningsValue: {
    fontFamily: "pbold",
    fontSize: 18,
    color: "#0a3d62", // even darker blue
  },
  // New style for the setup budget prompt when it's below earnings
  setupBudgetPromptBelowEarnings: {
    paddingHorizontal: 10, // Match padding of earnings container
  },
  currentBudgetsContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderTopWidth: 1,
    borderColor: "#9F54B6",
  },
  currentBudgetsTitle: {
    fontSize: 18,
    fontFamily: "psemibold",
    color: "#000000",
    marginBottom: 16,
    textAlign: "center",
  },
  toggleButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    marginBottom: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  toggleButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "pregular",
    color: "#1d4ed8",
  },
  toggleIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  budgetList: {
    marginTop: 8,
  },
  budgetCard: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  budgetCardTitle: {
    color: "#000000",
    fontFamily: "psemibold",
    fontSize: 16,
    marginBottom: 4,
  },
  budgetCardAmount: {
    color: "#4b5563",
    fontSize: 14,
  },
  budgetCardDates: {
    color: "#6b7280",
    fontSize: 12,
  },
  budgetCardDetailsButton: {
    color: "#2563eb",
    fontSize: 14,
    marginTop: 8,
    textAlign: "right",
    fontFamily: "pmedium",
  },
  addNewBudgetButton: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#22c55e",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  addNewBudgetButtonText: {
    color: "#FFFFFF",
    fontFamily: "psemibold",
    fontSize: 18,
  },
  noBudgetsContainer: {
    backgroundColor: "#f3f4f6",
    padding: 24,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  noBudgetsText: {
    color: "#4b5563",
    fontFamily: "pmedium",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  setupFirstBudgetButton: {
    backgroundColor: "#22c55e",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  setupFirstBudgetButtonText: {
    color: "white",
    fontFamily: "psemibold",
    fontSize: 18,
  },
  spacer: {
    height: 80,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
    maxHeight: "70%",
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 22,
    fontFamily: "pbold",
    color: "#333",
  },
  modalMessage: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    fontFamily: "pregular",
    color: "#555",
  },
  badgeList: {
    width: "100%",
    maxHeight: 200,
    marginBottom: 15,
  },
  badgeItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
  badgeName: {
    fontSize: 16,
    fontFamily: "pmedium",
    color: "#333",
  },
  badgeDescription: {
    fontSize: 14,
    fontFamily: "pregular",
    color: "#666",
    marginTop: 2,
  },
  noBadgesText: {
    fontSize: 15,
    fontFamily: "pregular",
    color: "#888",
    textAlign: "center",
    marginTop: 10,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
    marginTop: 15,
  },
  textStyle: {
    color: "white",
    fontFamily: "pbold",
    textAlign: "center",
    fontSize: 16,
  },
});

export default Budget;
