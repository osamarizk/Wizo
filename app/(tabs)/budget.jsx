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
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import { useGlobalContext } from "../../context/GlobalProvider";
import GradientBackground from "../../components/GradientBackground";
import { useNavigation, useFocusEffect } from "expo-router";
import Collapsible from "react-native-collapsible";
import icons from "../../constants/icons";

import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";

import {
  getUserBudgets,
  chkBudgetInitialization,
  getCategories2Bud,
  getUserPoints,
  getUserEarnedBadges,
  getReceiptsForPeriod,
} from "../../lib/appwrite";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutLayoutAnimationEnabledExperimental(true);
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
  const [monthlySpendingSummary, setMonthlySpendingSummary] = useState([]);

  const [showPointsBadgeModal, setShowPointsBadgeModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // --- Added console.log for component render cycle ---
  console.log(
    "Budget Component Rendered. isLoadingData:",
    isLoadingData,
    "refreshing:",
    refreshing
  );

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

  const fetchAllCategories = useCallback(async () => {
    if (!user?.$id) {
      console.log("fetchAllCategories: User ID not available.");
      return;
    }
    console.log("fetchAllCategories: Attempting to fetch categories...");
    try {
      const categories = await getCategories2Bud();
      const map = {};
      categories.forEach((cat) => {
        map[cat.$id] = cat.name;
      });
      setCategoriesMap(map);
      console.log(
        "fetchAllCategories: Fetched categories successfully. Map size:",
        Object.keys(map).length
      );
    } catch (error) {
      console.error(
        "fetchAllCategories: Error fetching all categories:",
        error
      );
      Alert.alert("Error", "Failed to load categories.");
    }
  }, [user?.$id]);

  const getCategoryName = (categoryId) => {
    return categoriesMap[categoryId] || "Unknown Category";
  };

  const fetchBudgetData = useCallback(async () => {
    console.log("fetchBudgetData: Function started.");
    if (!user?.$id) {
      console.log(
        "fetchBudgetData: User ID not available, stopping data fetch."
      );
      setIsLoadingData(false);
      return;
    }

    if (!refreshing) {
      console.log("fetchBudgetData: Setting isLoadingData to TRUE.");
      setIsLoadingData(true);
    }

    try {
      console.log("fetchBudgetData: Checking budget initialization...");
      const initialized = await chkBudgetInitialization(user.$id);
      setIsBudgetInitialized(initialized);
      console.log("fetchBudgetData: Budget initialized status:", initialized);

      const budgets = initialized ? await getUserBudgets(user.$id) : [];
      setUserBudgets(budgets);
      console.log(
        "fetchBudgetData: Fetched user budgets, count:",
        budgets.length
      );

      console.log("fetchBudgetData: Fetching user points...");
      const userPointsDocs = await getUserPoints(user.$id);
      if (userPointsDocs && userPointsDocs.length > 0) {
        setUserTotalPoints(userPointsDocs[0].points || 0);
      } else {
        setUserTotalPoints(0);
      }
      console.log(
        "fetchBudgetData: User Total Points fetched:",
        userTotalPoints
      );

      console.log("fetchBudgetData: Fetching earned badges...");
      const earnedBadges = await getUserEarnedBadges(user.$id);
      setUserBadges(earnedBadges);
      console.log(
        "fetchBudgetData: User Badges fetched, count:",
        earnedBadges.length
      );

      console.log("fetchBudgetData: Calling fetchAllCategories...");
      await fetchAllCategories(); // Ensure categories are loaded for mapping

      console.log("fetchBudgetData: Fetching receipts for current month...");
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);

      const receipts = await getReceiptsForPeriod(
        user.$id,
        currentMonthStart.toISOString(),
        currentMonthEnd.toISOString()
      );
      console.log(
        "fetchBudgetData: Fetched receipts for period, count:",
        receipts.length
      );

      const spendingByCat = {};
      receipts.forEach((receipt) => {
        const categoryId = receipt.categoryId;
        const amount = parseFloat(receipt.total);
        if (categoryId && !isNaN(amount)) {
          spendingByCat[categoryId] = (spendingByCat[categoryId] || 0) + amount;
        }
      });

      console.log("fetchBudgetData: Processing spending summary...");
      const summary = Object.keys(spendingByCat)
        .map((categoryId) => {
          const categoryName = getCategoryName(categoryId);
          const spent = spendingByCat[categoryId];
          const budgetForCategory = budgets.find(
            (b) => b.categoryId === categoryId
          );
          const budgetedAmount = budgetForCategory
            ? parseFloat(budgetForCategory.budgetAmount)
            : 0;
          const percentageOfBudget =
            budgetedAmount > 0 ? (spent / budgetedAmount) * 100 : 0;
          const remaining = budgetedAmount - spent;

          return {
            categoryId,
            categoryName,
            spent,
            budgetedAmount,
            percentageOfBudget: Math.min(100, percentageOfBudget),
            isOverBudget: budgetedAmount > 0 && spent > budgetedAmount,
            remaining: remaining,
          };
        })
        .sort((a, b) => b.spent - a.spent);

      setMonthlySpendingSummary(summary);
      console.log("fetchBudgetData: Monthly spending summary updated.");
    } catch (error) {
      console.error("fetchBudgetData: !!! ERROR during data fetch !!!", error);
      Alert.alert("Error", "Failed to load budget data.");
    } finally {
      console.log(
        "fetchBudgetData: Setting isLoadingData to FALSE in finally block."
      );
      setIsLoadingData(false);
      setRefreshing(false);
      console.log("fetchBudgetData: Function finished.");
    }
  }, [user?.$id, refreshing, fetchAllCategories]); // userBudgets removed as dependency (correct)

  useFocusEffect(
    useCallback(() => {
      console.log(
        "useFocusEffect: Budget screen focused, triggering data fetch..."
      );
      fetchBudgetData();
      return () => {
        console.log("useFocusEffect: Budget screen unfocused.");
        setIsExpanded(false);
        closeCustomModal();
      };
    }, [fetchBudgetData]) // fetchBudgetData is wrapped in useCallback, so this should be stable
  );

  const onRefresh = useCallback(async () => {
    console.log("onRefresh: Triggered.");
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
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>My Budgets</Text>
            <Image
              source={icons.pie}
              style={styles.headerIcon}
              tintColor="#9F54B6"
              resizeMode="contain"
            />
          </View>

          <Text style={styles.introText}>
            Set up and manage your budgets to keep track of your spending habits
            and financial goals.
          </Text>

          {(userTotalPoints > 0 ||
            userBadges.length > 0 ||
            showBudgetPrompt) && (
            <View style={styles.combinedEarningsAndPromptContainer}>
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

              {showBudgetPrompt && (
                <View style={styles.setupBudgetPromptBelowEarnings}>
                  <TouchableOpacity
                    onPress={SetupBudget}
                    style={styles.setupBudgetButton}
                  >
                    <Text style={styles.setupBudgetButtonText}>
                      Setup Budget
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {monthlySpendingSummary.length > 0 && (
            <View style={styles.spendingOverviewContainer}>
              <Text style={styles.spendingOverviewTitle}>
                Monthly Spending Overview
              </Text>
              {monthlySpendingSummary.map((item, index) => (
                <View
                  key={item.categoryId || index}
                  style={styles.spendingItem}
                >
                  <Text style={styles.spendingCategoryText}>
                    {item.categoryName}
                  </Text>
                  <Text style={styles.spendingAmountText}>
                    ${item.spent.toFixed(2)}
                    {item.budgetedAmount > 0 && (
                      <Text
                        style={
                          item.isOverBudget
                            ? styles.overBudgetWarning
                            : styles.budgetRemaining
                        }
                      >
                        {" "}
                        / ${item.budgetedAmount.toFixed(2)}
                      </Text>
                    )}
                  </Text>
                  {item.budgetedAmount > 0 && (
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${item.percentageOfBudget}%` },
                          item.isOverBudget && styles.progressBarOverBudget,
                        ]}
                      />
                    </View>
                  )}
                  {item.budgetedAmount > 0 && (
                    <Text
                      style={
                        item.isOverBudget
                          ? styles.overBudgetText
                          : styles.inBudgetText
                      }
                    >
                      {item.isOverBudget
                        ? `Over by $${Math.abs(item.remaining).toFixed(2)}`
                        : `Remaining: $${item.remaining.toFixed(2)}`}
                    </Text>
                  )}
                </View>
              ))}
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
                          ${parseFloat(budget.budgetAmount).toFixed(2)}
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

          {!(userTotalPoints > 0 || userBadges.length > 0) &&
            userBudgets.length === 0 &&
            monthlySpendingSummary.length === 0 &&
            !isLoadingData && (
              <View style={styles.noBudgetsContainer}>
                <Text style={styles.noBudgetsText}>
                  No budgets or spending data yet.
                </Text>
                <TouchableOpacity
                  onPress={SetupBudget}
                  style={styles.setupFirstBudgetButton}
                >
                  <Text style={styles.setupFirstBudgetButtonText}>
                    Start Your First Budget
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>

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
    fontFamily: "pextralight",
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
  pointsContainer: {
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
  combinedEarningsAndPromptContainer: {
    marginBottom: 20,
  },
  earningsDisplayContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  earningsItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  earningsItemButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  earningsIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    tintColor: "#2563eb",
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
    color: "#1e40af",
  },
  earningsValue: {
    fontFamily: "pbold",
    fontSize: 18,
    color: "#0a3d62",
  },
  setupBudgetPromptBelowEarnings: {
    paddingHorizontal: 0,
  },

  spendingOverviewContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  spendingOverviewTitle: {
    fontSize: 18,
    fontFamily: "psemibold",
    color: "#000000",
    marginBottom: 15,
    textAlign: "center",
  },
  spendingItem: {
    marginBottom: 15,
    alignItems: "flex-start",
  },
  spendingCategoryText: {
    fontSize: 16,
    fontFamily: "pmedium",
    color: "#333",
    marginBottom: 5,
  },
  spendingAmountText: {
    fontSize: 15,
    fontFamily: "pregular",
    color: "#555",
    marginBottom: 5,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 5,
  },
  progressBarOverBudget: {
    backgroundColor: "#ef4444",
  },
  inBudgetText: {
    fontSize: 13,
    fontFamily: "pregular",
    color: "#10b981",
    marginTop: 5,
  },
  overBudgetText: {
    fontSize: 13,
    fontFamily: "pregular",
    color: "#dc2626",
    marginTop: 5,
  },
  budgetRemaining: {
    color: "#6b7280",
    fontSize: 14,
  },
  overBudgetWarning: {
    color: "#dc2626",
    fontSize: 14,
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
