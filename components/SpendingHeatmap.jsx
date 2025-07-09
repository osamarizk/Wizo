import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  I18nManager,
} from "react-native";
import { format, getDay, getHours, isSameMonth, isSameYear } from "date-fns";
import { ar as arLocale } from "date-fns/locale";
import { useGlobalContext } from "../context/GlobalProvider";
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils"; // Assumed to return direct font family name
import i18n from "../utils/i18n";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const convertToArabicNumerals = (num) => {
  const numString = String(num || 0);
  if (typeof numString !== "string") return String(numString);
  const arabicNumeralsMap = {
    0: "٠",
    1: "١",
    2: "٢",
    3: "٣",
    4: "٤",
    5: "٥",
    6: "٦",
    7: "٧",
    8: "٨",
    9: "٩",
  };
  return numString.replace(/\d/g, (digit) => arabicNumeralsMap[digit] || digit);
};

// Reusable component for rendering the actual heatmap grid
const HeatmapGrid = ({
  heatmapData,
  maxSpending,
  getColorForSpending,
  handleCellPress,
  isFullScreen = false,
  displayedHours,
  preferredCurrencySymbol,
}) => {
  const { t } = useTranslation(); // Initialize translation hook
  const daysOfWeek = [
    t("common.dayShortSun"), // Sun
    t("common.dayShortMon"), // Mon
    t("common.dayShortTue"), // Tue
    t("common.dayShortWed"), // Wed
    t("common.dayShortThu"), // Thu
    t("common.dayShortFri"), // Fri
    t("common.dayShortSat"), // Sat
  ];

  const cellMargin = isFullScreen ? 2 : 1.5;
  const dayLabelColWidth = isFullScreen ? 45 : 35;

  const parentHorizontalPadding = 16;
  const heatmapContainerPadding = 5;

  const totalHorizontalMarginPerCell = 2 * cellMargin;

  // Calculate available width for cells, now using displayedHours.length
  const calculatedAvailableWidth =
    screenWidth -
    2 * parentHorizontalPadding -
    2 * heatmapContainerPadding -
    dayLabelColWidth -
    displayedHours.length * totalHorizontalMarginPerCell;
  const calculatedOptimalCellSize =
    calculatedAvailableWidth / displayedHours.length;

  // DECREASED MINIMUM CELL SIZES HERE
  const MIN_CELL_SIZE_FULL_SCREEN = 15; // Decreased from 28
  const MIN_CELL_SIZE_PREVIEW = 8; // Decreased from 16

  const cellSize = Math.max(
    isFullScreen ? MIN_CELL_SIZE_FULL_SCREEN : MIN_CELL_SIZE_PREVIEW,
    calculatedOptimalCellSize
  );

  const hourLabelFontSize = isFullScreen ? 12 : 10;
  const dayLabelFontSize = isFullScreen ? 12 : 10;
  const cellTextFontSize = isFullScreen ? 12 : 10;

  return (
    <View
      style={[
        styles.heatmapGridContainer,
        { flexDirection: I18nManager.isRTL ? "row-reverse" : "column" },
      ]}
    >
      {/* Hour Labels (Top Row) */}
      <View
        style={[
          styles.hourLabelsRow,
          {
            // Adjust margin based on RTL. This creates space for day labels.
            marginLeft: I18nManager.isRTL ? 0 : dayLabelColWidth,
            marginRight: I18nManager.isRTL ? dayLabelColWidth : 0,
            justifyContent: I18nManager.isRTL ? "flex-end" : "space-around", // Adjust content alignment for RTL
          },
        ]}
      >
        {displayedHours.map((hour) => (
          <Text
            key={`hour-${hour}`}
            style={[
              styles.hourLabel,
              {
                width: cellSize + totalHorizontalMarginPerCell,
                fontSize: hourLabelFontSize,
                fontFamily: getFontClassName("extrabold"), // Apply font
                textAlign: "center", // Keep center for hours
              },
            ]}
          >
            {i18n.language.startsWith("ar")
              ? convertToArabicNumerals(hour < 10 ? `0${hour}` : hour)
              : hour < 10
              ? `0${hour}`
              : hour}
          </Text>
        ))}
      </View>

      {/* Heatmap Grid */}

      <View
        style={[
          styles.gridContent,
          { flexDirection: I18nManager.isRTL ? "row-reverse" : "row" },
        ]}
      >
        <View
          style={[
            styles.dayLabelsColumn,
            {
              justifyContent: "flex-start",
              alignItems: I18nManager.isRTL ? "flex-end" : "flex-start",
            }, // Align text inside column
          ]}
        >
          {daysOfWeek.map((dayName, dayIndex) => (
            <Text
              key={`day-${dayIndex}`}
              style={[
                styles.dayLabel,
                {
                  height: cellSize + totalHorizontalMarginPerCell,
                  width: dayLabelColWidth,
                  fontSize: dayLabelFontSize,
                  fontFamily: getFontClassName("extrabold"), // Apply font
                  textAlign: "center", // Align day labels
                },
              ]}
            >
              {dayName}
            </Text>
          ))}
        </View>
        {/* Cells */}
        <View style={styles.cellsContainer}>
          {daysOfWeek.map((_, dayIndex) => (
            <View
              key={`row-${dayIndex}`}
              style={[
                styles.row,
                { flexDirection: I18nManager.isRTL ? "row-reverse" : "row" },
              ]}
            >
              {displayedHours.map((hourIndex) => {
                const cellSpending =
                  heatmapData[dayIndex]?.[hourIndex]?.totalSpending || 0;
                const cellColor = getColorForSpending(cellSpending);

                const isDarkBackground = cellColor === "#1E2C3D"; // Darkest color in your palette
                const textColor = isDarkBackground ? "#FFFFFF" : "#4E17B3"; // Use purple for light backgrounds

                return (
                  <TouchableOpacity
                    key={`cell-${dayIndex}-${hourIndex}`}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: cellColor,
                        width: cellSize,
                        height: cellSize,
                        margin: cellMargin,
                      },
                    ]}
                    onPress={() => handleCellPress(dayIndex, hourIndex)}
                    activeOpacity={cellSpending > 0 ? 0.6 : 1}
                  >
                    {cellSpending > 0 && (
                      <Text
                        style={[
                          styles.cellText,
                          {
                            fontSize: cellTextFontSize,
                            color: textColor,
                            fontFamily: getFontClassName("extrabold"), // Apply font
                          },
                        ]}
                      >
                        {i18n.language.startsWith("ar")
                          ? convertToArabicNumerals(cellSpending.toFixed(0))
                          : cellSpending.toFixed(0)}{" "}
                        ({preferredCurrencySymbol})
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const SpendingHeatmap = ({
  allReceipts,
  isLoading,
  preferredCurrencySymbol,
}) => {
  const { t } = useTranslation();

  const [heatmapData, setHeatmapData] = useState({});
  const [maxSpending, setMaxSpending] = useState(0);
  const [displayedHours, setDisplayedHours] = useState([]);
  const [showHeatmapDetailsModal, setShowHeatmapDetailsModal] = useState(false);
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState(null);
  const [showFullScreenHeatmapModal, setShowFullScreenHeatmapModal] =
    useState(false);

  useEffect(() => {
    if (!allReceipts || allReceipts.length === 0) {
      setHeatmapData({});
      setMaxSpending(0);
      setDisplayedHours([]);
      return;
    }

    const newHeatmapData = {};
    for (let d = 0; d < 7; d++) {
      newHeatmapData[d] = {};
      for (let h = 0; h < 24; h++) {
        newHeatmapData[d][h] = {
          totalSpending: 0,
          receipts: [],
        };
      }
    }

    let currentMaxSpending = 0;
    const today = new Date();
    const uniqueHoursWithData = new Set();

    allReceipts.forEach((receipt) => {
      try {
        const receiptDate = new Date(receipt.datetime);

        if (isSameMonth(receiptDate, today) && isSameYear(receiptDate, today)) {
          const dayOfWeek = getDay(receiptDate);
          const hourOfDay = getHours(receiptDate);

          const total = parseFloat(receipt.total) || 0;

          if (
            newHeatmapData[dayOfWeek] &&
            newHeatmapData[dayOfWeek][hourOfDay]
          ) {
            newHeatmapData[dayOfWeek][hourOfDay].totalSpending += total;
            newHeatmapData[dayOfWeek][hourOfDay].receipts.push({
              merchant: receipt.merchant,
              total: receipt.total,
              datetime: receipt.datetime,
              id: receipt.$id,
            });
            uniqueHoursWithData.add(hourOfDay);

            if (
              newHeatmapData[dayOfWeek][hourOfDay].totalSpending >
              currentMaxSpending
            ) {
              currentMaxSpending =
                newHeatmapData[dayOfWeek][hourOfDay].totalSpending;
            }
          }
        }
      } catch (error) {
        console.error("Error processing receipt for heatmap:", receipt, error);
      }
    });

    let finalDisplayHours = Array.from(uniqueHoursWithData).sort(
      (a, b) => a - b
    );

    if (finalDisplayHours.length === 0) {
      finalDisplayHours = [0, 1, 2, 3, 4, 5, 6];
    } else if (finalDisplayHours.length < 7) {
      let hourToPad = 0;
      while (finalDisplayHours.length < 7 && hourToPad < 24) {
        if (!finalDisplayHours.includes(hourToPad)) {
          finalDisplayHours.push(hourToPad);
        }
        hourToPad++;
      }
      finalDisplayHours.sort((a, b) => a - b);
    }

    setHeatmapData(newHeatmapData);
    setMaxSpending(currentMaxSpending);
    setDisplayedHours(finalDisplayHours);
  }, [allReceipts]);

  const getColorForSpending = useCallback(
    (spending) => {
      if (maxSpending === 0 || spending === 0) return "transparent";

      const percentageOfMax = spending / maxSpending;

      if (percentageOfMax <= 0.2) return "#F9C74F";
      if (percentageOfMax <= 0.4) return "#B0E0F2";
      if (percentageOfMax <= 0.6) return "#86CBEB";
      if (percentageOfMax <= 0.8) return "#5CA7E4";
      return "#1E2C3D";
    },
    [maxSpending]
  );

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleCellPress = useCallback(
    (day, hour) => {
      const cellData = heatmapData[day]?.[hour];
      if (cellData && cellData.totalSpending > 0) {
        setShowFullScreenHeatmapModal(false);
        setTimeout(() => {
          setSelectedHeatmapCell({ day, hour, ...cellData });
          setShowHeatmapDetailsModal(true);
        }, 100);
      }
    },
    [heatmapData]
  );

  // Check if there's any data to display in the heatmap
  const hasHeatmapData =
    displayedHours.length > 0 &&
    Object.values(heatmapData).some((dayData) =>
      Object.values(dayData).some((hourData) => hourData.totalSpending > 0)
    );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="small" color="#9F54B6" />
        <Text
          className="text-gray-600 mt-2" // Removed font class
          style={{ fontFamily: getFontClassName("regular") }} // Applied font
        >
          {t("heatmap.generatingHeatmap")} {/* Translated */}
        </Text>
      </View>
    );
  }

  return (
    <View className="p-2 mb-4 rounded-md bg-transparent border-t border-[#9F54B6]">
      <Text
        className={`text-lg text-black mb-1 ${
          I18nManager.isRTL ? "text-right" : "text-left" // Align title
        }`} // Removed font-pbold
        style={{ fontFamily: getFontClassName("bold") }} // Applied font
      >
        {t("heatmap.spendingHeatmapTitle")} {/* Translated */}
      </Text>
      <Text
        className={`text-sm text-gray-700 mb-4 ${
          I18nManager.isRTL ? "text-right" : "text-left" // Align description
        }`} // Removed font-pregular
        style={{ fontFamily: getFontClassName("regular") }} // Applied font
      >
        {t("heatmap.spendingHeatmapDescription")} {/* Translated */}
      </Text>

      {!hasHeatmapData && displayedHours.length === 0 ? (
        <Text
          className="text-gray-500 italic text-center" // Removed font-pregular
          style={{ fontFamily: getFontClassName("regular") }} // Applied font
        >
          {t("heatmap.noHeatmapData")} {/* Translated */}
        </Text>
      ) : (
        <TouchableOpacity
          onPress={() => setShowFullScreenHeatmapModal(true)}
          activeOpacity={0.9}
          className="w-full items-center justify-center"
        >
          <HeatmapGrid
            heatmapData={heatmapData}
            maxSpending={maxSpending}
            getColorForSpending={getColorForSpending}
            handleCellPress={handleCellPress}
            isFullScreen={false}
            displayedHours={displayedHours}
            preferredCurrencySymbol={preferredCurrencySymbol}
          />
          <Text
            className={`text-blue-600 mt-2 ${
              I18nManager.isRTL ? "text-right" : "text-left"
            }`} // Removed font-psemibold
            style={{ fontFamily: getFontClassName("semibold") }} // Applied font
          >
            {t("heatmap.tapToViewFullScreen")} {/* Translated */}
          </Text>
        </TouchableOpacity>
      )}

      {/* Heatmap Details Modal (for individual cell details) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showHeatmapDetailsModal}
        onRequestClose={() => setShowHeatmapDetailsModal(false)}
      >
        <Pressable
          style={styles.centeredModalView} // Using StyleSheet for full-screen overlay
          onPress={() => setShowHeatmapDetailsModal(false)}
        >
          <View
            style={styles.modalContent} // Using StyleSheet for modal content styling
            onStartShouldSetResponder={() => true}
          >
            <Text
              className={`text-xl mb-4 text-center ${
                I18nManager.isRTL ? "text-right" : "text-left"
              }`} // Removed font-pbold
              style={{ fontFamily: getFontClassName("bold") }} // Applied font
            >
              {t("heatmap.spendingOn")} {/* Translated "Spending on " */}
              {selectedHeatmapCell
                ? t(`common.dayLong${daysOfWeek[selectedHeatmapCell.day]}`)
                : ""}{" "}
              {/* Translated Day Name */}
              {t("heatmap.atTime")} {/* Translated "at " */}
              {selectedHeatmapCell
                ? `${
                    i18n.language.startsWith("ar")
                      ? convertToArabicNumerals(selectedHeatmapCell.hour)
                      : selectedHeatmapCell.hour
                  }:00`
                : ""}
            </Text>
            {selectedHeatmapCell && selectedHeatmapCell.totalSpending > 0 ? (
              <>
                <Text
                  className={`text-base mb-2 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`} // Removed font-psemibold
                  style={{ fontFamily: getFontClassName("semibold") }} // Applied font
                >
                  {t("heatmap.totalSpent")}:{" "}
                  {i18n.language.startsWith("ar")
                    ? convertToArabicNumerals(
                        selectedHeatmapCell.totalSpending.toFixed(2)
                      )
                    : selectedHeatmapCell.totalSpending.toFixed(2)}{" "}
                  {preferredCurrencySymbol}
                </Text>
                <Text
                  className={`text-base mb-2 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`} // Removed font-psemibold
                  style={{ fontFamily: getFontClassName("semibold") }} // Applied font
                >
                  {t("heatmap.numberOfReceipts")}:{" "}
                  {i18n.language.startsWith("ar")
                    ? convertToArabicNumerals(
                        selectedHeatmapCell.receipts.length
                      )
                    : selectedHeatmapCell.receipts.length}
                </Text>
                <Text
                  className={`text-lg mt-4 mb-2 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`} // Removed font-pbold
                  style={{ fontFamily: getFontClassName("bold") }} // Applied font
                >
                  {t("heatmap.receipts")}:
                </Text>
                <ScrollView style={styles.receiptsList}>
                  {selectedHeatmapCell.receipts.map((receipt, index) => (
                    <View
                      key={receipt.id || index}
                      style={[
                        styles.receiptItem,
                        {
                          flexDirection: I18nManager.isRTL
                            ? "row-reverse"
                            : "row",
                        },
                      ]} // Adjust direction
                    >
                      <Text
                        className={`text-blue-500 text-base ${
                          I18nManager.isRTL ? "text-right" : "text-left"
                        }`} // Removed font-pregular
                        style={{ fontFamily: getFontClassName("semibold") }} // Applied font
                      >
                        {receipt.merchant} -{" "}
                        {i18n.language.startsWith("ar")
                          ? convertToArabicNumerals(receipt.total.toFixed(2))
                          : receipt.total.toFixed(2)}{" "}
                        {preferredCurrencySymbol} {" | "}(
                        {format(new Date(receipt.datetime), "HH:mm", {
                          locale: i18n.language.startsWith("ar")
                            ? arLocale
                            : undefined,
                        })}
                        )
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            ) : (
              <Text
                className="text-gray-500 italic text-center" // Removed font-pmedium
                style={{ fontFamily: getFontClassName("bold") }} // Applied font
              >
                {t("heatmap.noSpendingForSlot")} {/* Translated */}
              </Text>
            )}
            <TouchableOpacity
              onPress={() => setShowHeatmapDetailsModal(false)}
              className="bg-red-500 p-3 rounded-lg w-full items-center mt-4"
            >
              <Text
                className="text-white text-lg" // Removed font-pbold
                style={{ fontFamily: getFontClassName("bold") }} // Applied font
              >
                {t("common.close")} {/* Translated */}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* NEW: Full-Screen Heatmap Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showFullScreenHeatmapModal}
        onRequestClose={() => setShowFullScreenHeatmapModal(false)}
      >
        <SafeAreaView style={styles.fullScreenModalContainer}>
          <View
            style={[
              styles.fullScreenModalHeader,
              { flexDirection: I18nManager.isRTL ? "row-reverse" : "row" }, // Adjust header direction
            ]}
          >
            <Text
              style={[
                styles.fullScreenModalTitle,
                { fontFamily: getFontClassName("bold") }, // Apply font
              ]}
            >
              {t("heatmap.detailedSpendingHeatmap")} {/* Translated */}
            </Text>
            <TouchableOpacity
              onPress={() => setShowFullScreenHeatmapModal(false)}
            >
              <Text
                style={[
                  styles.fullScreenCloseButton,
                  { fontFamily: getFontClassName("semibold") }, // Apply font
                ]}
              >
                {t("common.close")} {/* Translated */}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal={true}
            contentContainerStyle={styles.fullScreenHeatmapScrollViewContent}
            // For RTL, initial scroll position might need adjustment if not auto-handled by RN
            // You might need a ref and `scrollToEnd` or `scrollTo({x: <width>})` if issues arise.
          >
            <HeatmapGrid
              heatmapData={heatmapData}
              maxSpending={maxSpending}
              getColorForSpending={getColorForSpending}
              handleCellPress={handleCellPress}
              isFullScreen={true}
              displayedHours={displayedHours}
              preferredCurrencySymbol={preferredCurrencySymbol}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  heatmapContainer: {
    flexDirection: "column", // Base direction; will be overridden by HeatmapGrid's logic
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  heatmapGridContainer: {
    // This will be dynamically set by the component based on I18nManager.isRTL
    // flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  hourLabelsRow: {
    flexDirection: "row", // Base direction; will be overridden by HeatmapGrid's logic for RTL
    width: "100%",
    justifyContent: "space-around",
    marginBottom: 5,
  },
  hourLabel: {
    textAlign: "center",
    color: "#666",
    // fontFamily and fontSize applied directly in JSX
  },
  gridContent: {
    // This will be dynamically set by the component based on I18nManager.isRTL
    // flexDirection: "row",
    width: "100%",
  },
  dayLabelsColumn: {
    flexDirection: "column",
    justifyContent: "flex-start",
    marginRight: 2, // Default LTR margin
    // alignItems and textAlign will be handled in JSX based on RTL
  },
  dayLabel: {
    textAlignVertical: "center",
    color: "#666",
    // fontFamily, fontSize, and textAlign applied directly in JSX
  },
  cellsContainer: {
    flexDirection: "column",
    flexGrow: 1,
  },
  row: {
    // This will be dynamically set by the component based on I18nManager.isRTL
    // flexDirection: "row",
    justifyContent: "space-around",
  },
  cell: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#9F54B6",
    borderRadius: 4,
  },
  cellText: {
    // fontFamily and fontSize applied directly in JSX
  },
  centeredModalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(70,80,90,0.5)",
  },
  modalContent: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: I18nManager.isRTL ? "flex-end" : "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: screenWidth * 0.9,
    maxHeight: "80%",
  },
  receiptsList: {
    width: "100%",
    maxHeight: 200,
  },
  receiptItem: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    // flexDirection will be overridden by JSX based on RTL
  },
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fullScreenModalHeader: {
    // flexDirection will be overridden by JSX based on RTL
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingTop: Platform.OS === "ios" ? 40 : 10,
  },
  fullScreenModalTitle: {
    fontSize: 20,
    color: "#333",
    // fontWeight and fontFamily applied directly in JSX
  },
  fullScreenCloseButton: {
    fontSize: 16,
    color: "#007AFF",
    // fontFamily applied directly in JSX
  },
  fullScreenHeatmapScrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});

export default SpendingHeatmap;
