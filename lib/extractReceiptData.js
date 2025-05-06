import * as FileSystem from "expo-file-system";
import Constants from "expo-constants";

export async function extractReceiptData(imageUri) {
  const GEMINI_API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY;
  // console.log("Gemeni Key:", GEMINI_API_KEY);
  try {
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image,
              },
            },
            {
              text: `Extract this receipt info as JSON with these fields: merchant, datetime, location, items (name, price, category, subcategory), subtotal, vat, total.

Classify each item using these predefined categories and subcategories:

1. Food & Dining
   - Groceries, Restaurants, Cafes, Fast Food, Bars
2. Transportation
   - Fuel, Public Transport, Taxi/Rideshare, Parking, Vehicle Maintenance
3. Shopping
   - Clothing, Electronics, Household Items, Personal Care, Online Shopping
4. Health & Wellness
   - Pharmacy, Doctor Visits, Fitness, Insurance
5. Bills & Utilities
   - Electricity, Water, Internet, Mobile, Rent/Mortgage, Subscription Services
6. Entertainment & Leisure
   - Movies, Concerts, Events, Hobbies, Travel
7. Business Expenses
   - Office Supplies, Business Travel, Client Meals, Subscriptions, Software
8. Education
   - Tuition Fees, Books, Courses, School Supplies
9. Financial Services
   - Bank Fees, Loan Payments, Investments, Insurance Premiums
10. Gifts & Donations
   - Charitable Donations, Gifts, Fundraising Events
11. Miscellaneous
   - Use only if no other category fits.

Return ONLY valid JSON. No extra text or formatting.`,
            },
          ],
        },
      ],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    console.log("Gemini Raw Response:", JSON.stringify(result, null, 2)); // 🔍 DEBUG

    const textResponse =
      result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!textResponse) {
      throw new Error("Empty response from Gemini");
    }

    // Clean up the response to remove the markdown code block:
    const cleanedResponse = textResponse.replace(/^```json|```$/g, "").trim();

    // Now parse the cleaned-up JSON
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Receipt extraction failed:", error);
    throw new Error("Failed to extract receipt data.");
  }
}
