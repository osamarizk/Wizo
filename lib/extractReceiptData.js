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
                mimeType: "image/jpeg", // Ensure this matches your image type
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
    "datetime": "...", // Format as ISO 8601 string (e.g., "YYYY-MM-DDTHH:mm:ss.sssZ")
    "location": { 
      "address": "...", // Full address as it appears on the receipt. If not found, return null.
      "city": "...",     // City name. If the city is NOT explicitly on the receipt, 
                         // and you are absolutely certain of the city based on other information, 
                         // provide it. If you are NOT certain, leave city as null.
      "country": "..."   // Country name (e.g., "Egypt", "USA", "Germany").
                         // If the country is NOT explicitly on the receipt, 
                         // and you are absolutely certain of the country based on other information, 
                         // provide it. If you are NOT certain, leave country as null.
    },
    "items": [
      {
        "name": "...",
        "price": ...,
        "category": "...",
        "subcategory": "..."
      }
    ],
    "subtotal": ..., // The sum of all individual item prices BEFORE any discounts or taxes.
    "discount": ..., // Total discount applied to the receipt. Look for terms like "discount", "disc", "promo", "reduction", "savings", "coupon". If no discount is found, return 0.
    "vat": ...,      // Total VAT (Value Added Tax) or other sales taxes applied to the receipt. Look for terms like "VAT", "tax", "sales tax", "service charge", "service fee", "taxes". If no such amount is found, return 0.
    "total": ...,    // The FINAL amount paid by the customer, after all discounts and including all taxes. This is the final amount due.
    "currency": "...", // The currency of the transaction (e.g., "EGP", "USD", "EUR"). If not explicitly stated, infer from context, the extracted country, or leave as null.
    "paymentMethod": "...", // The method of payment (e.g., "Cash", "Credit Card", "Debit Card", "Mobile Pay", "Gift Card"). If not found, return null.
    "transactionId": "...", // A unique identifier for the transaction or receipt number. If not found, return null.
    "cardLastFourDigits": "...", // The last four digits of the credit/debit card used for payment. If not found, return null.
    "cashierId": "...", // The ID of the cashier or server. Look for terms like "cashier", "server", "employee ID". If not found, return null.
    "storeBranchId": "...", // The specific branch name or ID if the merchant has multiple locations. Look for "branch", "store #", "location ID". If not found, return null.
    "loyaltyPoints": ..., // The number of loyalty points earned or redeemed during the transaction. If not found, return 0.
    "loyaltyProgram": "...", // The name of the loyalty program associated with the transaction. If not found, return null.
    "notes": "..." // Any additional relevant notes, comments, or special instructions from the receipt. If not found, return null.
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
        `Error parsing JSON: ${parseError.message}. Raw response: ${cleanedResponse}`
      );
    }
  } catch (error) {
    console.error("Receipt extraction failed:", error);
    return {
      isReceipt: false,
      message: `Failed to extract or detect receipt. Please try again. Details: ${error.message}`,
      data: null,
    };
  }
}
