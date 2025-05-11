import * as FileSystem from "expo-file-system";
import Constants from "expo-constants";

export async function extractReceiptData(imageUri) {
  const GEMINI_API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY;

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
              text: `First, determine if this image is a store receipt.

If yes, respond with:
{
  "isReceipt": true,
  "message": "Receipt detected.",
  "data": {
    "merchant": "...",
    "datetime": "...",
    "location": { 
      "address": "...", // Full address as it appears on the receipt
      "city": "..."    // City name (e.g., "Cairo", "Alexandria", "Giza").  
                      //  If the city is NOT explicitly on the receipt, 
                      //  and you are absolutely certain of the city
                      //  based on other information, provide it.  
                      //  If you are NOT certain, leave city as null.
      "country": "Egypt" // Add Country
    },
    "items": [
      {
        "name": "...",
        "price": ...,
        "category": "...",
        "subcategory": "..."
      }
    ],
    "subtotal": ...,
    "vat": ...,
    "total": ...
  }
}

If no, respond with:
{
  "isReceipt": false,
  "message": "This image does not appear to be a receipt.",
  "data": null
}

Classify each item using these predefined categories and subcategories:

1. Food & Dining
    - Restaurants, Groceries, Cafes, Fast Food, Bars, Delivery
2. Transportation
    - Fuel, Public Transport, Taxi/Rideshare, Parking, Vehicle Maintenance, Tolls
3. Shopping
    - Clothing, Electronics, Household Items, Personal Care, Online Shopping, Books, Furniture
4. Health & Wellness
    - Pharmacy, Doctor Visits, Fitness, Insurance, Dental Care, Vision Care
5. Bills & Utilities
    - Electricity, Water, Internet, Mobile, Rent/Mortgage, Subscription Services, Cable TV
6. Entertainment & Leisure
    - Movies, Concerts, Events, Hobbies, Travel, Streaming Services, Sports
7. Business Expenses
    - Office Supplies, Business Travel, Client Meals, Subscriptions, Software, Advertising, Training
8. Education
    - Tuition Fees, Books, Courses, School Supplies, Student Loans
9. Financial Services
    - Bank Fees, Loan Payments, Investments, Insurance Premiums, Credit Card Fees
10. Gifts & Donations
    - Charitable Donations, Gifts, Fundraising Events
11. Home Improvement
    - Plumbing, Electrician, Gardening
12. Miscellaneous
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
    console.log("Gemini Raw Response:", JSON.stringify(result, null, 2));

    const textResponse =
      result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!textResponse) {
      throw new Error("Empty response from Gemini");
    }

    const cleanedResponse = textResponse.replace(/^```json|```$/g, "").trim();

    try {
      const jsonResponse = JSON.parse(cleanedResponse);

      // Sanity check for required structure
      if (typeof jsonResponse.isReceipt !== "boolean") {
        throw new Error("Unexpected response format from Gemini.");
      }
      return jsonResponse;
    } catch (parseError) {
      throw new Error(
        `Error parsing JSON: ${parseError.message}.  Raw response: ${cleanedResponse}`
      );
    }
  } catch (error) {
    console.error("Receipt extraction failed:", error);
    return {
      isReceipt: false,
      message: `Failed to extract or detect receipt. Please try again.  Details: ${error.message}`,
      data: null,
    };
  }
}
