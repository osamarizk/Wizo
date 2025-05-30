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
    "merchant": "...", // Crucial: Identify the main merchant name. It is typically a prominent name or logo at the very top of the receipt. Look for the largest or most central text that identifies the business, even if it's in Arabic (e.g., "خبزه وشاورما"). If not found, return null.
    "datetime": "...", // Format as ISO 8601 string (e.g., "YYYY-MM-DDTHH:mm:ss.sssZ")
    "location": {
      "address": "...", // Full address as it appears on the receipt, including specific mall names (e.g., "Dandy Mall") or street details, even if on a second line below the merchant name. If not found, return null.
      "city": "...",    // Important: Extract the city name. The city is often near the address, but might also be near the merchant name, or appear without a full street address. For example, "الشيخ زايد" is a city. If you can clearly identify the city on the receipt, provide it. If not explicitly stated and you cannot infer with high certainty, leave as null.
      "country": "..."  // Country name (e.g., "Egypt", "USA", "Germany"). Infer the country from explicit mentions, context, or *especially from VAT Registration numbers or Sales Tax IDs*, as these are often country-specific identifiers. If you are NOT certain, leave country as null.
    },
    "items": [ // EXPLICIT DEFINITION OF AN ITEM: Only extract lines that represent a distinct, purchasable product or service with its own clearly stated, associated numeric price. These are typically listed with a quantity (e.g., "2x", "QTY 1") or are standalone services/products with their price directly beside them. Lines that are descriptive details of a previous item (e.g., "Cappuccino" for a "Donuts + Drink" combo, "Cinnamon Crunch, Cola Filled" describing a donut type, "Full cream milk" for a coffee, or "sample of flavors" for a tasting) AND DO NOT have their own separate, explicit price, MUST NOT be listed as individual items here.
      {
        "name": "...", // The name of the distinct, purchasable item.
        "price": ..., // The price of this specific item. This MUST be the price explicitly printed next to the item's name. If no explicit price is present for a line, that line is NOT an item for this array. Never assign a price based on assumption or from other receipt totals (like subtotal, total, or VAT). Ensure prices are parsed correctly, converting any ':' or ',' decimal separators to '.' (e.g., "111:00" should be 111.00).
        "category": "...",
        "subcategory": "..."
      }
    ],
    "subtotal": ..., // Read the EXACT 'Subtotal' or 'صافي' amount printed on the receipt. Do NOT calculate this from the items list. Convert any ':' or ',' decimal separators to '.'
    "discount": ..., // Total discount applied to the receipt. Look for terms like "discount", "disc", "promo", "reduction", "savings", "coupon". If no discount is found, return 0. Convert any ':' or ',' decimal separators to '.'
    "vat": ...,      // Read the EXACT 'VAT' or 'ضريبة القيمة المضافة' amount printed on the receipt. Do NOT calculate this. Convert any ':' or ',' decimal separators to '.'
    "total": ...,    // Read the EXACT 'Total' or 'اجمالي' FINAL amount paid by the customer, after all discounts and including all taxes, as printed on the receipt. Do NOT calculate this. Convert any ':' or ',' decimal separators to '.'
    "currency": "...", // The currency of the transaction (e.g., "EGP", "USD", "EUR"). If not explicitly stated, infer based on the extracted country (if available) or from other context on the receipt. If inference is not possible, return null.
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
    // console.log("Gemini Raw Response:", JSON.stringify(result, null, 2));

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
