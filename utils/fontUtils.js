// utils/fontUtils.js
import i18n from "./i18n"; // Import your i18next instance

/**
 * Returns the appropriate font family name string based on the current language and desired weight.
 * This function is designed to be used directly in a `style={{ fontFamily: ... }}` prop.
 *
 * @param {string} weight - The font weight (e.g., 'thin', 'extralight', 'light', 'regular', 'medium', 'semibold', 'bold', 'extrabold', 'black').
 * @returns {string} The direct font family string (e.g., 'Poppins-Regular', 'Cairo-ExtraBold').
 */
export const getFontClassName = (weight = "regular") => {
  const isArabic = i18n.language.startsWith("ar");

  // Define a map for English (Poppins) font family names
  // THESE VALUES MUST EXACTLY MATCH THE KEYS YOU USE IN YOUR useFonts.js FOR POPPINS!
  const englishFontMap = {
    thin: "Poppins-Thin",
    extralight: "Poppins-ExtraLight",
    light: "Poppins-Light",
    regular: "Poppins-Regular",
    medium: "Poppins-Medium",
    semibold: "Poppins-SemiBold",
    bold: "Poppins-Bold",
    extrabold: "Poppins-ExtraBold",
    black: "Poppins-Black",
  };

  // Define a map for Arabic (Cairo) font family names
  // THESE VALUES MUST EXACTLY MATCH THE KEYS YOU USE IN YOUR useFonts.js FOR CAIRO!
  const arabicFontMap = {
    thin: "Cairo-ExtraLight", // Cairo_200ExtraLight
    extralight: "Cairo-ExtraLight", // Cairo_200ExtraLight
    light: "Cairo-Light", // Cairo_300Light
    regular: "Cairo-Regular", // Cairo_400Regular
    medium: "Cairo-Medium", // Cairo_500Medium
    semibold: "Cairo-SemiBold", // Cairo_600SemiBold
    bold: "Cairo-Bold", // Cairo_700Bold
    extrabold: "Cairo-ExtraBold", // Cairo_800ExtraBold
    black: "Cairo-Black", // Cairo_900Black
  };

  // Select the correct font map based on language
  const activeFontMap = isArabic ? arabicFontMap : englishFontMap;

  // Set default font family string based on language
  // This is used if the requested 'weight' doesn't exist in the map.
  const defaultFontName = isArabic ? "Cairo-Regular" : "Poppins-Regular";

  // Return the direct font family string, falling back to the default if specific weight not found
  // This `|| defaultFontName` is what ensures a fallback if, say, you ask for 'thin' Poppins
  // but it's not defined in `englishFontMap`.
  return activeFontMap[weight] || defaultFontName;
};
