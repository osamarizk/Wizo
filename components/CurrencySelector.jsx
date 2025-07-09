import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, I18nManager, Dimensions, TextInput } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils";
import i18n from "../utils/i18n"; // Ensure this path is correct for your i18n instance

const screenWidth = Dimensions.get("window").width;

// A simplified map of country codes to common currency codes
const countryCodeToCurrencyMap = {
  // North America
  US: { code: "USD", symbol: "$" },
  CA: { code: "CAD", symbol: "C$" },
  MX: { code: "MXN", symbol: "Mex$" },

  // Europe
  GB: { code: "GBP", symbol: "£" },
  EU: { code: "EUR", symbol: "€" },
  DE: { code: "EUR", symbol: "€" },
  FR: { code: "EUR", symbol: "€" },
  IT: { code: "EUR", symbol: "€" },
  ES: { code: "EUR", symbol: "€" },
  RU: { code: "RUB", symbol: "₽" },
  CH: { code: "CHF", symbol: "CHF" },

  // Asia
  JP: { code: "JPY", symbol: "¥" },
  CN: { code: "CNY", symbol: "¥" },
  IN: { code: "INR", symbol: "₹" },
  SA: { code: "SAR", symbol: "ر.س" }, // Saudi Arabia
  AE: { code: "AED", symbol: "د.إ" }, // UAE
  EG: { code: "EGP", symbol: "ج.م" }, // Egypt
  TR: { code: "TRY", symbol: "₺" },
  SG: { code: "SGD", symbol: "S$" },
  AU: { code: "AUD", symbol: "A$" },

  // South America
  BR: { code: "BRL", symbol: "R$" },
  AR: { code: "ARS", symbol: "$" },

  // Africa
  ZA: { code: "ZAR", symbol: "R" },
  NG: { code: "NGN", symbol: "₦" },

  // Default fallback
  DEFAULT: { code: "USD", symbol: "$" },
};

const CurrencySelector = ({
  initialCountryCode,
  initialCurrencyCode,
  onCurrencyChange,
  containerStyles = "",
  labelStyles = "",
}) => {
  const { t } = useTranslation();
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  // Define currencyData here so it can use `t` for translation
  const currencyData = [
    { label: t("common.selectPreferredCurrency"), value: "", symbol: "" }, // <-- ADDED: First item as placeholder
    { label: "US Dollar ($)", value: "USD", symbol: "$" },
    { label: "Euro (€)", value: "EUR", symbol: "€" },
    { label: "British Pound (£)", value: "GBP", symbol: "£" },
    { label: "Japanese Yen (¥)", value: "JPY", symbol: "¥" },
    { label: "Saudi Riyal (ر.س)", value: "SAR", symbol: "ر.س" },
    { label: "UAE Dirham (د.إ)", value: "AED", symbol: "د.إ" },
    { label: "Egyptian Pound (ج.م)", value: "EGP", symbol: "ج.م" },
    { label: "Canadian Dollar (C$)", value: "CAD", symbol: "C$" },
    { label: "Australian Dollar (A$)", value: "AUD", symbol: "A$" },
    { label: "Indian Rupee (₹)", value: "INR", symbol: "₹" },
    { label: "Brazilian Real (R$)", value: "BRL", symbol: "R$" },
    { label: "Swiss Franc (CHF)", value: "CHF", symbol: "CHF" },
    { label: "Turkish Lira (₺)", value: "TRY", symbol: "₺" },
    { label: "Russian Ruble (₽)", value: "RUB", symbol: "₽" },
    // Add more currencies as needed
  ];

  useEffect(() => {
    if (initialCurrencyCode) {
      setSelectedCurrency(initialCurrencyCode);
    } else if (initialCountryCode) {
      const derivedCurrency = countryCodeToCurrencyMap[initialCountryCode.toUpperCase()];
      if (derivedCurrency) {
        setSelectedCurrency(derivedCurrency.code);
      } else {
        // Fallback to a default if country code is unknown, or to the empty placeholder
        setSelectedCurrency(""); // Set to empty string for the "Select preferred currency" option
      }
    } else {
      // Fallback if no country code or initial currency is provided
      setSelectedCurrency(""); // Set to empty string for the "Select preferred currency" option
    }
  }, [initialCountryCode, initialCurrencyCode]);

  const handleDropdownChange = useCallback((item) => {
    setSelectedCurrency(item.value);
    if (onCurrencyChange) {
      onCurrencyChange(item.value); // Pass the selected currency code to the parent
    }
  }, [onCurrencyChange]);

  // Function to render each item in the dropdown list
  const renderItem = useCallback((item, isSelected) => {
    return (
      <View style={[styles.item, I18nManager.isRTL ? styles.itemRTL : styles.itemLTR]}>
        <Text
          style={[
            styles.itemText,
            isSelected && styles.selectedItemText,
            { fontFamily: getFontClassName("regular") },
            { textAlign: i18n.language.startsWith("ar") ? "right" : "left" },
          ]}
        >
          {item.label}
        </Text>
      </View>
    );
  }, []);

  // Function to render the search input inside the dropdown list
  const renderInputSearch = useCallback((props) => {
    return (
      <TextInput
        {...props}
        style={[
          styles.inputSearchStyle,
          { textAlign: i18n.language.startsWith("ar") ? "right" : "left" },
          { fontFamily: getFontClassName("regular") },
        ]}
        placeholder={t("common.searchCurrency")}
        placeholderTextColor="#A1A1AA"
      />
    );
  }, [t]);


  return (
    <View className={`mb-4 ${containerStyles}`}>
      <Text
        className={`text-gray-700 text-base mb-2 ${
          I18nManager.isRTL ? "text-right" : "text-left"
        } ${labelStyles}`}
        style={{ fontFamily: getFontClassName("medium") }}
      >
        {t("common.currencyPreference")}
      </Text>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={{
          ...styles.placeholderStyle,
          fontFamily: getFontClassName("regular"),
          textAlign: i18n.language.startsWith("ar") ? "right" : "left",
        }}
        selectedTextStyle={{
          ...styles.selectedTextStyle,
          fontFamily: getFontClassName("regular"),
          textAlign: i18n.language.startsWith("ar") ? "right" : "left",
        }}
        iconStyle={styles.iconStyle}
        data={currencyData} // Using the updated currencyData
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={t("common.selectPreferredCurrency")} // <-- FIXED: Use the new translated placeholder
        searchPlaceholder={t("common.searchCurrency")}
        value={selectedCurrency} // This will now correctly show the placeholder if value is ""
        onChange={handleDropdownChange}
        renderItem={renderItem}
        renderInputSearch={renderInputSearch}
        dropdownPosition="bottom"
        containerStyle={[
          styles.dropdownListContainer,
          {
            width: screenWidth * 0.9,
            marginHorizontal: (screenWidth - (screenWidth * 0.9)) / 2,
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    width: screenWidth * 0.9,
    alignSelf: 'center',
    borderColor: "#4E17B3",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#A1A1AA",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#333",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  dropdownListContainer: {
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: 'white',
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRTL: {
    flexDirection: 'row-reverse',
  },
  itemLTR: {
    flexDirection: 'row',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  selectedItemText: {
    fontWeight: 'bold',
    color: '#4E17B3',
  },
});

export default CurrencySelector;
