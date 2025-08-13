// utils/i18n.js
import { I18nManager } from "react-native";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Define your translations as a resource object for i18next
const resources = {
  en: {
    translation: {
      onboarding: {
        heroText:
          "Receipts are tedious to manage, often lost and hard to track.",
        feature1: "🔥 Capture and upload your receipt with ease.",
        feature2: "🔥 Let ResynQ handle the Receipts processing.",
        feature3: "🔥 Say goodbye to the hassle of manual work.",
        feature4: "🔥 No personal information is shared ever.",
        slogan: "O7 Empower the best solution",
        continueWithMail: "Continue with mail",
      },
      auth: {
        accessAccount: "Access Your Account",
        emailAddress: "Email Address",
        enterEmailPlaceholder: "your@example.com",
        password: "Password",
        enterPasswordPlaceholder: "Enter your password",
        forgotPassword: "Forgot password?",
        signInButton: "Sign In",
        noAccountQuestion: "Don't have an Account?",
        signUpLink: "Sign Up",
        fillAllFieldsError: "Please fill in all fields.",
        invalidEmailError: "Please enter a valid email address.",
        loginFailedMessage: "An unexpected error occurred during login.",
        passwordResetSuccessTitle: "Password Reset",
        passwordResetSuccessMessage:
          "A password reset link has been sent to your email address. Please check your inbox (and spam folder).",
        passwordResetFailedMessage: "Failed to send password reset email.",
        otpSentSuccessMessage: "OTP sent to your email.",
        resetPasswordTitle: "Reset Password",
        enterEmailInstruction: "Enter your email address",
        sendEmailButton: "Send Email",
        cancelButton: "Cancel",
        registerAccount: "Register for O7 Account",
        username: "User Name",
        enterUsernamePlaceholder: "Your unique username",
        emailAddress: "Email Address", // Already exists, but ensure it's here
        enterEmailPlaceholder: "your@example.com", // Already exists, but ensure it's here
        password: "Password", // Already exists, but ensure it's here
        enterPasswordPlaceholderShort: "Min. 8 characters", // For password field
        confirmPassword: "Confirm Password",
        reenterPasswordPlaceholder: "Re-enter your password",
        agreeToTermsPrefix: "I agree to the app's ",
        agreeToTermsSuffix: ".",
        signUpButton: "Sign Up",
        haveAccountQuestion: "Have an Account already?",
        signInLink: "Sign In",
        fillAllFieldsError: "Please fill all fields.",
        invalidEmailError: "Please enter a valid email address.",
        passwordsMismatchError: "Passwords do not match.",
        passwordLengthError: "Password must be at least 8 characters long.",
        agreeTermsError:
          "You must agree to the Terms of Service and Privacy Policy.",
        signUpErrorTitle: "Sign Up Error",

        passwordResetGenericConfirmation:
          "If an account with that email address exists, a password reset link has been sent to it. Please check your inbox (and spam folder).",
      },
      common: {
        hello: "Hello",
        save: "Save",
        cancel: "Cancel",
        confirm: "Confirm",
        ok: "OK",
        close: "Close",
        upgradeNow: "Upgrade Now",
        later: "Later",
        error: "Error",
        success: "Success",
        loading: "Loading...",
        somethingWentWrong: "Something went wrong. Please try again.",
        unlimited: "Unlimited",
        user: "User", // for default user name
        dateFormatShort: "MMM dd, yyyy",
        dateFormatLong: "MMM dd, yyyy HH:mm", // Short date format, e.g., Jan 01, 2024
        not_available_short: "N/A",
        dataLoadErrorTitle: "Data Load Error",
        dataLoadErrorMessage: "Failed to load some data. Please try again.",
        userOrAppSettingsNotLoaded:
          "User or application settings not loaded. Please try again.",
        sharingNotAvailable: "Sharing is not available on your platform.",
        yesDelete: "Yes, Delete",
        noCancel: "No, Cancel",
        languageChangeTitle: "Language Changed",
        languageChangeMessageAppLayout:
          "Language has been changed successfully!",
        languageChangeMessage:
          "Language has been changed. For full text direction (RTL/LTR) changes to take effect, some devices might require a complete app restart.",
        monthNames: {
          // NEW for month name localization
          0: "January",
          1: "February",
          2: "March",
          3: "April",
          4: "May",
          5: "June",
          6: "July",
          7: "August",
          8: "September",
          9: "October",
          10: "November",
          11: "December",
        },
        currency_symbol_short: "EGP", // For chart axis label
        percentageSymbol: "%",
        searching: "Searching...", // For loading indicator
        upload: "Upload",
        exclamationMark: "!",
        errorTitle: "Error",
        successTitle: "Success",
        ok: "OK",
        later: "Later",
        upgradeNow: "Upgrade Now",
        unknown: "Unknown", // For merchant/category defaults
        unknownMerchant: "Unknown Merchant", // Specific for duplicate message
        unknownLocation: "Unknown", // For location string default
        uncategorized: "Uncategorized", // For subcategory default
        unnamedItem: "Unnamed item", // For item name default
        not_available_short: "N/A", // For fields like loyalty points
        cash: "Cash", // Default payment method
        unknownError: "Unknown error", // For catch-all error messages
        percentageSymbol: "%", // Already there, but confirm if not.
        dateFormatShort: "MMM dd, yyyy", // Already there, but confirm
        timeFormatShort: "hh:mm a", // NEW: For time formatting (e.g., "03:30 PM")
        cancel: "Cancel",
        unknownMerchant: "Unknown Merchant",
        currency_symbol_short: "EGP", // or whatever your currency symbol is
        deleting: "Deleting...",
        downloading: "Downloading...",
        unknownError: "Unknown error",
        unnamedItem: "Unnamed Item",
        notAvailableShort: "N/A",
        currency_symbol_short: "EGP",
        languageChangeRestartTitle: "Language Change",
        languageChangeRestartMessage:
          "Please restart the app for the language change to take full effect.",
        restart: "Restart",
        close: "Close",
        dayShortSun: "Sun",
        dayShortMon: "Mon",
        dayShortTue: "Tue",
        dayShortWed: "Wed",
        dayShortThu: "Thu",
        dayShortFri: "Fri",
        dayShortSat: "Sat",
        dayLongSun: "Sunday", // Add long names for full detail in modal
        dayLongMon: "Monday",
        dayLongTue: "Tuesday",
        dayLongWed: "Wednesday",
        dayLongThu: "Thursday",
        dayLongFri: "Friday",
        dayLongSat: "Saturday",
        success: "Success",
        failed: "Failed",
        upgradeToPremium: "Upgrade to Premium",
        userOrSettingsNotLoaded:
          "User or application settings not loaded. Please try again.",
        view: "View",
        failedToLoadData: "Failed to load data. Please try again.",
        failedToLoadSubcategories: "Failed to load subcategories.",
        failedToSaveBudget: "Failed to save budget. Please try again.",
        success: "Success",
        failed: "Failed",
        back: "Back",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        cancel: "Cancel",
        unlimited: "Unlimited",
        id: "ID",
        date: "Date",
        merchant: "Merchant",
        total: "Total",
        category: "Category",
        subcategory: "Subcategory",
        items: "Items",
        viewDetails: "View Details",
        update: "Update",
        delete: "Delete",
        cancel: "Cancel",
        success: "Success",
        error: "Error",
        notApplicable: "N/A",
        notifications: "Notifications",
        close: "Close",
        infoTitle: "Info",
        errorTitle: "Error",
        successTitle: "Success",
        infoTitle: "Info",
        invalidEmailTitle: "Invalid Email",
        loginFailedTitle: "Login Failed",
        unexpectedError: "An unexpected error occurred.",
        errorTitle: "Error",
        invalidEmailTitle: "Invalid Email",
        unknownError: "An unexpected error occurred.",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
        and: "and",
        unknownError: "An unexpected error occurred. Please try again.",
        invalidAmount: "Invalid Amount",
        missingType: "Missing Type",
        authenticationError: "Authentication Error",
        success: "Success",
        userOrSettingsNotLoaded:
          "User or application settings not loaded. Please try again.",
        unknownCategory: "Unknown Category",
        later: "Later",
        upgradeNow: "Upgrade Now",
        unlimited: "Unlimited",
        loading: "Loading...",
        back: "Back",
        success: "Success!",
        error: "Error",
        searching: "Searching...",
        upload: "Upload",
        currency_symbol_short: "EGP",
        currencyPreference: "Currency Preference",
        selectCurrency: "Select Currency",
        searchCurrency: "Search Currency...",
        selectPreferredCurrency: "Select preferred currency",
        amount: "Amount",
        month: "Month",
        back: "Back",
        category: "Category",
        spent: "Spent",
        budgeted: "Budgeted",
        remaining: "Remaining",
        month: "Month",
        totalSpent: "Total Spent",
        surplusDeficit: "Surplus/Deficit",
        unknownCategory: "Unknown Category",
        errorTitle: "Error",
        successTitle: "Success",
        ok: "OK",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        confirm: "Confirm",
        loading: "Loading...",
        unknown: "Unknown",
        yes: "Yes",
        no: "No",
        back: "Back",
        errorTitle: "Error",
        unknownError: "An unknown error occurred.",
        successTitle: "Success!",
        infoTitle: "Information",
        week: "week",
        weeks: "weeks",
        noInternetTitle: "No Internet Connection",
        noInternetMessage: "Please check your network settings and try again.",
      },
      aiMessages: {
        // Update this line to match the exact message from your AI API
        notAReceiptDefault: "This image does not appear to be a receipt.",
        imageQualityTooLow:
          "Image quality too low. Please try a clearer image.",
        noTextDetected:
          "No readable text detected in the image. Please ensure the receipt is clear.",
        couldNotProcessImage:
          "We encountered an issue processing this image. Please try again or with a different receipt.",
        noItemsFound: "No items found in the receipt.",
        missingMerchantName: "Could not identify merchant name.",
        geminiEmptyResponse:
          "Failed to extract or detect receipt. Please try again. Details: Empty response from AI.",
        genericAiError:
          "An unexpected issue occurred during AI processing. Please try again. Details: {{message}}",
        modelOverloaded:
          "The AI model is currently overloaded. Please try again in a moment.",
        // ... any other aiMessages keys
      },
      receiptProcess: {
        // NEW NAMESPACE
        userSettingsError:
          "User or application settings not loaded. Please try again.",
        limitReachedTitle: "Limit Reached!",
        limitReachedMessage:
          "You've reached your monthly limit of {{freeLimit}} receipt uploads. Upgrade to Premium for unlimited uploads and more features!",
        notAReceiptTitle: "Not a Receipt",
        notAReceiptMessage: "This image is not a receipt.",
        processedSuccess: "Receipt processed successfully!",
        consentRequiredTitle: "Consent Required",
        consentRequiredMessage:
          "Please agree to save your data before proceeding.",
        missingData: "Missing receipt data or image or user info.",
        duplicateTitle: "Duplicate Receipt",
        duplicateMessage:
          "This receipt for {{merchant}} on {{date}} already exists and won't be saved again.",
        savedSuccess: "Receipt saved successfully!",
        savedPartialSuccess:
          "Receipt saved, but full user refresh might be needed.",
        saveFailed: "Receipt was not saved. Please try again.",
        generalSaveError: "Could not save receipt.",
        savingReceipt: "♥️ Saving your receipt", // Message when saving
        extractedSuccess: "Receipt Extracted Successfully", // Message after extraction
        tapToViewFull: "Tap to view full",
        processingMessage:
          "Processing...\n Our platform uses advanced AI to automatically extract key details from your uploaded receipt.",
        merchant: "Merchant",
        location: "Location",
        date: "Date",
        category: "Category",
        items: "Items",
        showLess: "(▲ Show less)",
        showMore: "(Show more ▼)",
        unnamedItem: "Unnamed item", // Item list default
        hideItemsShowDetails: "▲ Hide Items & Show Details",
        showAllItems: "▼ Show All Items",
        subtotal: "Subtotal",
        vat: "VAT",
        total: "Total",
        consentMessage:
          "By saving, you agree that your data will be used to improve our AI models while preserving your privacy.",
        save: "Save", // Save button text
        saving: "Saving...", // Save button text when saving
        process: "Process", // Process button text
        cancel: "Cancel", // Cancel button text (confirm if in common already)
        dataSavingSecurely: "Your data is saving securely...",
        pleaseWaitProcessing: "Please wait while we process your request.",
        generalProcessingError:
          "Failed to process receipt data. Please ensure the image is clear and try again.",
        aiProcessingErrorTitle: "AI Processing Error",
      },
      editReceipt: {
        editReceipt: "Edit Receipt",
        errorMissingData: "Receipt data is missing. Cannot save.",
        errorMerchantEmpty: "Merchant name cannot be empty.",
        errorTotalInvalid: "Total must be a valid positive number.",
        saveSuccess: "Receipt updated successfully!",
        saveFailed: "Failed to save: {{message}}",
        saveFailedAlert: "Failed to save receipt: {{message}}",
        merchantName: "Merchant Name",
        enterMerchantName: "Enter merchant name",
        totalAmount: "Total Amount",
        enterTotalAmount: "Enter total amount",
        itemsReadOnly: "Items (Read-Only)",
        saveChanges: "Save Changes",
        noChangesMade: "No changes were made to the receipt.",
      },
      receiptDetails: {
        title: "Receipt Details",
        // ... other keys for this modal
      },
      categories: {
        // NEW NAMESPACE FOR MAIN CATEGORIES
        foodDining: "Food & Dining",
        transportation: "Transportation",
        shopping: "Shopping",
        healthWellness: "Health & Wellness",
        billsUtilities: "Bills & Utilities",
        entertainmentLeisure: "Entertainment & Leisure",
        businessExpenses: "Business Expenses",
        education: "Education",
        financialServices: "Financial Services",
        giftsDonations: "Gifts & Donations",
        homeImprovement: "Home Improvement",
        miscellaneous: "Miscellaneous",
      },
      subcategories: {
        // NEW NAMESPACE FOR SUBCATEGORIES
        // Food & Dining Subcategories
        restaurants: "Restaurants",
        groceries: "Groceries",
        cafes: "Cafes",
        fastFood: "Fast Food",
        bars: "Bars",
        delivery: "Delivery",

        // Transportation Subcategories
        fuel: "Fuel",
        publicTransport: "Public Transport",
        taxiRideshare: "Taxi/Rideshare",
        parking: "Parking",
        vehicleMaintenance: "Vehicle Maintenance",
        tolls: "Tolls",

        // Shopping Subcategories
        clothing: "Clothing",
        electronics: "Electronics",
        householdItems: "Household Items",
        personalCare: "Personal Care",
        onlineShopping: "Online Shopping",
        books: "Books",
        furniture: "Furniture",

        // Health & Wellness Subcategories
        pharmacy: "Pharmacy",
        doctorVisits: "Doctor Visits",
        fitness: "Fitness",
        insurance: "Insurance",
        dentalCare: "Dental Care",
        visionCare: "Vision Care",

        // Bills & Utilities Subcategories
        electricity: "Electricity",
        water: "Water",
        internet: "Internet",
        mobile: "Mobile",
        rentMortgage: "Rent/Mortgage",
        subscriptionServices: "Subscription Services",
        cableTv: "Cable TV",

        // Entertainment & Leisure Subcategories
        movies: "Movies",
        concerts: "Concerts",
        events: "Events",
        hobbies: "Hobbies",
        travel: "Travel",
        streamingServices: "Streaming Services",
        sports: "Sports",

        // Business Expenses Subcategories
        officeSupplies: "Office Supplies",
        businessTravel: "Business Travel",
        clientMeals: "Client Meals",
        subscriptions: "Subscriptions", // Reused if general "Subscriptions"
        software: "Software",
        advertising: "Advertising",
        training: "Training",

        // Education Subcategories
        tuitionFees: "Tuition Fees",
        educationBooks: "Books", // Renamed to avoid conflict with Shopping Books
        courses: "Courses",
        schoolSupplies: "School Supplies",
        studentLoans: "Student Loans",

        // Financial Services Subcategories
        bankFees: "Bank Fees",
        loanPayments: "Loan Payments",
        investments: "Investments",
        insurancePremiums: "Insurance Premiums",
        creditCardFees: "Credit Card Fees",

        // Gifts & Donations Subcategories
        charitableDonations: "Charitable Donations",
        gifts: "Gifts",
        fundraisingEvents: "Fundraising Events",

        // Home Improvement Subcategories
        plumbing: "Plumbing",
        electrician: "Electrician",
        gardening: "Gardening",

        // Miscellaneous Subcategories (if any specific ones besides the main category name)
        // No explicit subcategories listed, so "Miscellaneous" will stand alone.
      },
      home: {
        welcome: "Welcome",
        myReceipts: "My Receipts",
        uploadNewReceipt: "Upload New Receipt",
        receiptOptions: "Receipt Options",
        viewReceipt: "View Receipt",
        editReceipt: "Edit Receipt",
        downloadReceipt: "Download Receipt",
        deleteReceipt: "Delete Receipt",
        noReceipts: "No receipts to display.",
        uploadFirstReceipt: "Upload your first receipt to see it here!",
        monthlyUsageTracker: "Monthly Usage Tracker",
        receiptsUploaded: "Receipts Uploaded",
        receiptsRemaining: "Remaining",
        downloadsUsed: "Downloads Used",
        downloadsRemaining: "Remaining",
        limitReached: "Limit Reached!",
        upgradeForUnlimited: "Upgrade to Premium for unlimited features!",
        goodMorning: "Good morning",
        goodAfternoon: "Good afternoon",
        goodEvening: "Good evening",
        unknownCategory: "Unknown Category", // for getCategoryName fallback
        initialDataUploadError: "Error uploading initial data.", // for initialDataUpload
        loadingDashboard: "Loading your dashboard...",
        noMerchantData: "No merchant data for this category.",
        merchant: "Merchant",
        total: "Total",
        visits: "Visits",
        noSpendingData: "No spending data available.",
        noMonthlySpendingData: "No monthly spending data for this category.",
        merchantAnalysisForCategory: "Merchant Analysis for {{category}}", // with interpolation
        searchingReceipts: "Searching receipts...",
        noResultsFound: "No results found.",
        monthlySpendingOverview: "Monthly Spending Overview",
        spendingTrends: "Spending Trends",
        spendingTrendsTitle: "Spending Trends (Last 6 Months)",
        unknownMerchant: "Unknown Merchant",
        monthlyReceiptsUploads: "Monthly Receipts Uploads", // Add this if it's a new distinct label
        monthlyReceiptsDownloads: "Monthly Receipts Downloads", // Add this if it's a new distinct label
        receiptsOnMonth: "R on {{monthName}}", // NEW
        monthSpending: "{{monthName}} Spending", // NEW
        lastReceiptDate: "Last Receipt Date",
        spendingCategoriesOf: "Spending Categories of", // NEW
        viewDetailsPrompt: "👇 View details 👇", // NEW (or choose a non-emoji version if preferred)
        noSpendingDataAvailable: "No spending data available.", // NEW (replaces the hardcoded italic text)
        spendingTrendsTitle: "Spending Trends (Last 6 Months)", // This should already be there from previous updates
        loadingSpendingTrends: "Loading spending trends...", // NEW
        noSpendingTrendsData:
          "No spending data available to show trends for the current year.", // NEW
        spendingTrendsCurrentYear: "Spending Trends (Current Year)", // NEW
        spendingTrendsDescription:
          "See your overall spending patterns over time, showing total expenditure per month for the current year.",
        topSpendingInsightOf: "Top Spending Insight of", // NEW
        spendingInsightDescription:
          "Calculation based on the individual item prices from your receipts, prior to any discounts, VAT, or other service charges.",
        searchFilterTitle: "Search & Filter",
        searchResults: "Search Results", // For search results title
        latestUploadedReceipts: "Latest Uploaded Receipts", // For default list title
        noSearchResults: "No receipts found matching your search criteria.", // For no search results message
        noReceiptsUploadedYet:
          "✨ No receipts uploaded yet. Let's get started! ✨", // For no receipts message
        detailsTitle: " Details", // Used for "Category Name Details"
        totalSpending: "Total", // For "Total Spending: X"
        merchantBreakdownTitle: "Merchant Breakdown", // For "Merchant Breakdown" title
        merchantSpendingDescription:
          "Merchant spending figures are calculated based on the individual item prices from your receipts, prior to any discounts, VAT, or other service charges.",
        receiptOptions: "Receipt Options",
        viewDetails: "View Details",
        editReceipt: "Edit Receipt",
        downloadImage: "Download Receipt",
        deleteReceipt: "Delete Receipt",
        unlimitedAdviceTitle: "Your Unlimited Financial Insights Await!",
        newAdviceAvailableTitle: "New Financial Advice Available!",
        freeAdviceRemainingHome:
          "You have {{count}} free advises remaining today.",
        checkYourAdvice: "Check Your Daily Advice",
        upgradeToUnlimited: "Upgrade for Unlimited Advice",
        noAdviceYet: "Tap to get your first insight today!",
        welcome: "Welcome",
        wizoDescriptionPart1:
          "🔥 ResynQ is your personal finance companion that turns your everyday receipts into powerful insights. Snap a photo, and ResynQ instantly extracts key data — like merchants, totals, and items — so you can track your spending, stay within budget, and understand where your money really goes.",
        wizoDescriptionPart2:
          "🔥 But ResynQ doesn’t stop with helping users — it also helps businesses make smarter decisions. With user-consented, anonymized spending data, ResynQ offers valuable market insights to brands and retailers. It's a win-win: users gain control over their finances, while businesses get better tools to serve their customers.",
        wizoDescriptionPart3:
          "🔥 Effortlessly track expenses, gain insights into your spending habits, and achieve your financial goals with ease!",
        searchPlaceholder: "Search by merchant name...",
        filterButton: "Filters",
        clearSearch: "Clear",
        filterModalTitle: "Filter Receipts",
        applyFiltersButton: "Apply Filters",
        clearFiltersButton: "Clear All Filters",
        noSearchResults: "No receipts found matching your criteria.",
        fromDate: "From Date",
        toDate: "To Date",
        selectCategory: "Select Category",
        selectSubcategory: "Select Subcategory",
        noSubcategoriesAvailable: "No subcategories available",
        selectDate: "Select Date",
        cancel: "Cancel",
        ok: "OK",
        merchantName: "Merchant Name", // NEW: For the merchant search input label
        endDateBeforeStartDateError: "End date cannot be before start date.",
        fromDate: "From Date",
        toDate: "To Date",
        selectDate: "Select Date",
        closeCalendar: "Close Calendar",
        applyFiltersButton: "Apply Filters",
        clearFiltersButton: "Clear All Filters",
        searchResults: "Search Results",
        latestUploadedReceipts: "Latest Uploaded Receipts",
        receiptOptions: "Receipt Options",
        viewDetails: "View Details",
        editReceipt: "Edit Receipt",
        downloadImage: "Download Image",
        downloading: "Downloading...",
        imageDownloadSuccessWeb: "Image opened in a new tab.",
        imageDownloadSuccessMobile: "Image downloaded and shared successfully!",
        confirmDeleteTitle: "Confirm Deletion",
        confirmDeleteMessage:
          "Are you sure you want to delete this receipt? This action cannot be undone.",
        deleteButton: "Delete",
        receiptDeleteSuccess: "Receipt deleted successfully!",
        receiptDeletedNotificationTitle: "Receipt Deleted",
        receiptDeletedNotificationMessage:
          "Receipt for {merchant} ({amount}{currencySymbol}) has been deleted.",
        receiptDeleteFailedNotificationTitle: "Receipt Deletion Failed",
        receiptDeleteFailedNotificationMessage:
          "Failed to delete receipt: {error}",
        spendingDetailsFor: "Spending Details for {category}",
        spendingDetails: "Spending Details",
        merchant: "Merchant",
        total: "Total",
        visits: "Visits",
        noMerchantData: "No merchant data available for this category.",
        searchResults: "Search Results",
        latestUploadedReceipts: "Latest Uploaded Receipts",
        noSearchResults: "No receipts found matching your criteria.",
        noReceiptsUploadedYet:
          "No receipts uploaded yet. Start by adding your first receipt!",
        unknownMerchant: "Unknown Merchant",
        searchPlaceholder: "Search by merchant name...", // For the main search input
        openFilter: "Open Filter", // For the filter button
        filtersActive: "Filters Active", // For the filter button when active
        premiumUser: "Premium User",
      },
      notifications: {
        receiptViewed: "Receipt Viewed",
        receiptDownloaded: "Receipt Downloaded & Shared",
        receiptDeleted: "Receipt Deleted",
        receiptEdited: "Receipt Edited",
        budgetDeleted: "Budget Deleted",
        downloadLimitReached: "Download Limit Reached",
        budgetLimitReachedNotification: "Budget Limit Reached",
        receiptViewedMessage:
          "You viewed the receipt for {{merchant}} from {{date}}.",
        downloadLimitReachedMessage:
          "You've reached your monthly limit of {{limit}} receipt downloads. Upgrade to Premium for unlimited downloads and more features!",
        downloadLimitNotificationMessage:
          "You've used all {{limit}} free monthly receipt downloads. Upgrade to Premium!",
        receiptDownloadedMessage:
          "Your receipt for {{merchant}} from {{date}} has been downloaded and shared successfully!",
        receiptDeletedMessage:
          "You deleted the receipt for {{merchant}} from {{date}}.",
        receiptEditedMessage:
          "You edited the receipt for {{merchant}} from {{date}}.",
        receiptUploadLimitReachedTitle: "Receipt Upload Limit Reached",
        receiptUploadLimitReachedMessage:
          "You've used all {{freeLimit}} free monthly receipt uploads. Upgrade to Premium!",
        duplicateReceiptDetectedTitle: "Duplicate Receipt Detected",
        duplicateReceiptDetectedMessage:
          "Your receipt for {{merchant}} on {{date}} was a duplicate and not saved.",
        receiptProcessedTitle: "Receipt Processed",
        receiptProcessedMessage:
          "Your receipt for {{merchant}} ({{total}}) has been successfully processed!",
        achievementUnlockedTitle: "Achievement Unlocked!",
        achievementUnlockedMessage:
          "You earned new badges: {{badgeNames}}! You earned Extra Points: {{pointsExtra}}!",
        receiptSaveFailedTitle: "Receipt Save Failed",
        receiptSaveFailedMessage:
          "Failed to save your receipt for {{merchant}}. Please try again.",
        receiptProcessingErrorTitle: "Receipt Processing Error",
        receiptProcessingErrorMessage:
          "An unexpected error occurred while saving your receipt. Error: {{errorMessage}}.",
        duplicateReceiptDetectedTitle: "Duplicate Receipt Detected",
        duplicateReceiptDetectedMessage:
          "Your receipt for {{merchant}} on {{date}} was a duplicate and not saved.",
        achievementUnlockedTitle: "Achievement Unlocked!",
        achievementUnlockedMessage:
          "You earned new badges: {{badgeNames}}! You earned Extra Points: {{pointsExtra}}!",
        achievementUnlockedTitle: "Achievement Unlocked!",
        achievementUnlockedMessage:
          "You earned new badges: {{badgeNames}}! You earned Extra Points: {{pointsExtra}}!",
        importantInfo:
          "Important notifications may have an expiry date and will disappear automatically once expired.",
        noNotificationsFound: "No notifications found.",
        noNotificationsYet: "No notifications yet.",
        tapToViewDetails: "Tap to view details ↗️",
        received: "Received:",
        receiptDetails: "Receipt Details:",
        merchant: "Merchant:",
        total: "Total:",
        date: "Date:",
        payment: "Payment:",
        loadingReceipt: "Loading receipt...",
        budgetDetails: "Budget Details:",
        budgetName: "Name:",
        budgetAmount: "Amount:",
        budgetCategoryId: "Category ID:",
        budgetStarts: "Starts:",
        budgetEnds: "Ends:",
        budgetNoLongerExists: "Budget no longer exists.",
        loadingBudget: "Loading budget...",
        expires: "Expires:",
        type: "Type:",
        budgetDeletedNotificationTitle: "Budget Deleted", // This title comes from the notification itself
        receiptUploadedNotificationTitle: "Receipt Uploaded", // Example title
        budgetAlertNotificationTitle: "Budget Alert", // Example title
        pointsEarnedNotificationTitle: "Points Earned", // Example title
        badgeEarnedNotificationTitle: "Badge Earned", // Example title
        receiptEditedNotificationTitle: "Receipt Edited",
        receiptEditedNotificationMessage:
          "The receipt for {{merchantName}} has been updated.",
        financialAdviceNotificationTitle: "Financial Advice", // Assuming this is the title for financial advice notifications
        financialAdviceDetails: "Advice Details:",
        loadingAdvice: "Loading financial advice...",
        premiumActivatedTitle: "Premium Activated!",
        premiumActivatedMessage:
          "Congratulations! Your premium subscription is now active. Enjoy all exclusive features!",
        premiumDeactivatedTitle: "Premium Deactivated",
        premiumDeactivatedMessage:
          "Your premium subscription is no longer active. Some features may be limited.",

        premiumActivatedMessage:
          "Your premium subscription is now active! Enjoy all the benefits.",
        premiumDeactivatedTitle: "Premium Deactivated",
        premiumDeactivatedMessage:
          "Your premium subscription has ended. Renew to continue enjoying premium features.",
      },
      settings: {
        applicationSettingsTitle: "Application Settings",
        generalPreferences: "General Preferences",
        enableNotifications: "Enable Notifications",
        comingSoon: "Coming Soon",
        darkMode: "Dark Mode",
        language: "Language",
        english: "English",
        arabic: "Arabic",
        currencyPreference: "Currency Preference",
        currencyTitle: "Currency", // For the Alert title
        currencyComingSoon: "Currency preference is coming soon!", // For the Alert message
        yourPlanBenefits: "Your Plan & Benefits",
        currentPlan: "Current Plan",
        premium: "Premium",
        freeTier: "Free Tier",
        monthlyReceiptUploadLimit: "Monthly Receipt Upload Limit",
        monthlyReceiptDownloadLimit: "Monthly Receipt Download Limit",
        activeBudgetLimit: "Active Budget Limit",
        monthlyDataExports: "Monthly Data Exports",
        advancedSpendingAnalytics: "Advanced Spending Analytics",
        priorityCustomerSupport: "Priority Customer Support",
        included: "Included",
        premiumStatus: "Premium",
        upgradeToPremium: "Upgrade to Premium",
        allPremiumFeaturesIncluded:
          "All Premium features are included in your plan!",
        featureManagement: "Feature Management",
        walletSetup: "Wallet Setup",
        complete: "Complete",
        notSetUp: "Not Set Up",
        budgetingSetup: "Budgeting Setup",
        dataPrivacy: "Data & Privacy",
        manageMyData: "Manage My Data",
        privacyControls: "Privacy Controls",
        saveSettings: "Save Settings",
        selectLanguage: "Select Language",
        notLoggedInSaveError: "You must be logged in to save settings.",
        settingsSavedSuccess: "Settings saved successfully!",
        failedToSaveSettings: "Failed to save settings. Please try again.",
        languageChangeRestartTitle: "Language Change",
        languageChangeRestartMessage:
          "For full language application, please restart the app.",
        bepremium: "Be Premium",
      },
      receipts: {
        // New namespace from Home.jsx needs
        receipts: "Receipts",
        receiptOptions: "Receipt Options",
        viewReceipt: "View Receipt",
        editReceipt: "Edit Receipt",
        downloadReceipt: "Download Receipt",
        deleteReceipt: "Delete Receipt",
        noImageAvailable: "No image available for this receipt.",
        failedToLoadReceiptImage: "Failed to load receipt image: {{error}}",
        receiptImageInfoMissing:
          "Receipt image information is missing. Cannot download.",
        failedToRetrieveDownloadUrl:
          "Failed to retrieve receipt image download URL.",
        failedToDownloadReceipt:
          "Failed to download or share receipt: {{error}}",
        confirmDeleteTitle: "Confirm Delete",
        confirmDeleteMessage:
          "Are you sure you want to delete this receipt? This action cannot be undone.",
        receiptDeletedSuccess: "Receipt deleted successfully!",
        failedToDeleteReceipt: "Failed to delete receipt: {{error}}",
        loadingImage: "Loading image...",
        receiptUpdatedTitle: "Receipt Updated",
        receiptUpdatedSuccess: "Receipt updated successfully!",
        failedToUpdateReceipt: "Failed to update receipt: {{error}}",
        paymentMethod_cash: "Cash",
        paymentMethod_card: "Card",
        paymentMethod_bankTransfer: "Bank Transfer",
        paymentMethod_mobilePayment: "Mobile Payment",
        paymentMethod_other: "Other",
      },
      points_badges: {
        // New namespace from Home.jsx needs
        yourPointsAndBadges: "Your Points & Badges",
        points: "Points",
        badges: "Badges",
        currentPoints: "Current Points",
        pointsMessage:
          "Earn more points by uploading receipts, setting budgets, and achieving financial goals!",
        earnedBadges: "Earned Badges",
        badgesMessage:
          "No badges earned yet. Keep using the app to unlock achievements!",
      },
      tabs: {
        home: "Home",
        spending: "Spending",
        upload: "Upload",
        wallet: "Wallet",
        budget: "Budget",
        account: "Account",
      },
      uploadModal: {
        uploadedReceiptsCount: "Uploaded Receipts #",
        pleaseSelectToUpload: "Please select to upload your receipts",
        camera: "Camera",
        gallery: "Gallery",
      },
      spending: {
        loadingSpendingInsights: "Loading spending insights...",
        spendingInsightsTitle: "Spending Insights",
        noReceiptsYet:
          "No receipts uploaded yet. Start tracking your spending!",
        receiptsPerMonthChartTitle: "Receipts per Month (Current Year)",
        receiptsPerMonthChartDescription:
          "This chart illustrates how many receipts you've uploaded each month throughout the current year. Tap on a month in the chart or the list to view its summary.",
        tapForDetails: "👇Tap for details",
        receiptsCount: "receipts", // e.g., "5 receipts"
        noReceiptsForCurrentYear: "No receipts for the current year yet.",
        spendingComparisonTitle: "Spending Comparison",
        spendingComparisonDescription:
          "Compare your spending this month against the previous month.",
        increase: "Increase",
        decrease: "Decrease",
        noChange: "No Change",
        notEnoughDataForComparison: "Not enough data for comparison yet.",
        averageReceiptValueTitle: "Average Receipt Value (Current Month)",
        averageReceiptValueDescription:
          "The average amount spent per receipt this month.",
        noReceiptsForAverage:
          "No receipts for this month to calculate average.",
        merchantAnalysisTitle: "Merchant Analysis",
        merchantVisitsOverview: "Merchant Visits Overview",
        merchantChartDescription: "Displaying top 5 merchants by visits.",
        merchant: "Merchant",
        totalAmountShort: "Total", // Placeholder for currency symbol. Actual symbol from common.currency_symbol_short will be used in code.
        visits: "Visits",
        view: "View",
        noMerchantData: "No merchant data available.",
        itemsBreakdownTitle: "Items Breakdown",
        item: "Item",
        totalSpend: "Total",
        timesBought: "Times Bought",
        noItemData: "No item data available.",
        visitsFor: "Visits for {{merchantName}}", // e.g., "Visits for Carrefour"
        noVisitDates: "No visit dates available.",
        purchasesFor: "Purchases for {{itemName}}", // e.g., "Purchases for Milk"
        noPurchaseDates: "No purchase dates available.",
        monthlySummaryFor: "Monthly Summary for ", // This key needs a space at the end for proper concatenation in the UI
      },
      heatmap: {
        generatingHeatmap: "Generating heatmap...",
        spendingHeatmapTitle: "Spending Heatmap (Current Month)",
        spendingHeatmapDescription:
          "This heatmap shows your spending patterns by day of the week and hour of the day for the current month. Each cell's color indicates total spending. Tap on a cell to see the detailed receipts for that time slot.",
        noHeatmapData:
          "No receipts for the current month yet. Upload some to see your patterns!",
        tapToViewFullScreen: "Tap to view full-screen",
        spendingOn: "Spending on ", // Keep trailing space
        atTime: " at ", // Keep trailing space
        totalSpent: "Total Spent",
        numberOfReceipts: "Number of Receipts",
        receipts: "Receipts",
        noSpendingForSlot: "No spending recorded for this time slot.",
        detailedSpendingHeatmap: "Detailed Spending Heatmap",
      },
      wallet: {
        loadingWallet: "Loading your wallet...",
        myWalletTitle: "My Wallet",
        walletDescription:
          "Manage your cash balance here. You can add or withdraw funds, and see a history of all your wallet transactions.",
        currentBalance: "Current Balance",
        monthlyCashFlow: "Monthly Cash Flow ({{month}},{{year}})",
        deposits: "Deposits",
        expensesWithdrawals: "Expenses/Withdrawals",
        netFlow: "Net Flow",
        averageCashExpenseTitle: "Average Cash Expense (This Month)",
        noCashExpensesThisMonth:
          "No cash expenses this month to calculate average.",
        recordNewTransaction: "Record New Transaction",
        recentTransactions: "Recent Transactions",
        noTransactionsYet: "No transactions yet.",
        transactionTypeDeposit: "Deposit",
        transactionTypeWithdrawal: "Withdrawal",
        transactionTypeManualExpense: "Manual Expense",
        depositDescription:
          "Funds received into your wallet (e.g., salary, cash deposit).",
        withdrawalDescription:
          "Cash taken out of your wallet for general use, not a specific purchase (e.g., ATM withdrawal, moving cash).",
        manualExpenseDescription:
          "An expense paid in cash or not recorded via receipt (e.g., small purchases, tips).",
        amountPlaceholder: "Amount ({{currencySymbol}})", // e.g., Amount ($)
        descriptionPlaceholder: "Description (Optional)",
        editTransactionTitle: "Edit Transaction",
        recordNewTransactionTitle: "Record New Transaction",
        updateTransaction: "Update Transaction",
        recordTransaction: "Record Transaction",
        cancel: "Cancel",
        transactionOptions: "Transaction Options",
        editTransactionButton: "Edit Transaction",
        deleteTransactionButton: "Delete Transaction",
        confirmDeletionTitle: "Confirm Deletion",
        confirmDeletionMessage:
          "Are you sure you want to delete this transaction? This action cannot be undone.",
        delete: "Delete",
        invalidAmount: "Invalid Amount",
        pleaseEnterValidAmount: "Please enter a valid positive amount.",
        missingType: "Missing Type",
        pleaseSelectTransactionType: "Please select a transaction type.",
        authenticationError: "Authentication Error",
        userNotLoggedIn: "User not logged in.",
        saveTransactionSuccess: "Transaction recorded successfully!",
        updateTransactionSuccess: "Transaction updated successfully!",
        transactionUpdatedNotificationTitle: "Wallet Transaction Updated",
        transactionUpdatedNotificationMessage:
          "Your {{type}} transaction for {{currencySymbol}}{{amount}} has been updated.",
        newTransactionNotificationTitle: "New Wallet Transaction",
        newTransactionNotificationMessage:
          "A new {{type}} transaction of {{currencySymbol}}{{amount}} has been recorded.",
        saveTransactionFailed: "Could not save transaction. Please try again.",
        transactionSaveFailedNotificationTitle: "Wallet Transaction Failed",
        transactionSaveFailedNotificationMessage:
          "Failed to save your wallet transaction: {{error}}.",
        deleteTransactionSuccess: "Transaction deleted successfully!",
        transactionDeletedNotificationTitle: "Wallet Transaction Deleted",
        transactionDeletedNotificationMessage:
          "Your {{type}} transaction for {{currencySymbol}}{{amount}} has been deleted.",
        deleteTransactionFailed: "Failed to delete transaction.",
        transactionDeletionFailedNotificationTitle:
          "Wallet Transaction Deletion Failed",
        transactionDeletionFailedNotificationMessage:
          "Failed to delete your wallet transaction: {{error}}.",
      },
      budget: {
        loadingBudgets: "Loading your budgets...",
        myBudgetsTitle: "My Budgets",
        budgetDescription:
          "Set spending limits for different categories to help you stay on track. Budgets are calculated monthly based on your receipt data and manual expenses.",
        setNewBudgetButton: "Set New Budget",
        noBudgetsSetYet:
          "No budgets set yet. Tap 'Set New Budget' to create your first one!",
        budgetFor: "Budget for {{categoryName}}",
        budgeted: "Budgeted",
        spent: "Spent",
        remaining: "Remaining",
        status: "Status",
        underBudget: "Under Budget",
        overBudget: "Over Budget",
        onBudget: "On Budget",
        noSpendingYet: "No spending yet",
        editBudgetTitle: "Edit Budget",
        setNewBudgetTitle: "Set New Budget",
        selectCategory: "Select Category",
        budgetAmountPlaceholder: "Budget Amount ({{currencySymbol}})",
        notesPlaceholder: "Notes (Optional)",
        saveBudgetButton: "Save Budget",
        updateBudgetButton: "Update Budget",
        cancelButton: "Cancel",
        confirmDeletionTitle: "Confirm Budget Deletion",
        confirmDeletionMessage:
          "Are you sure you want to delete this budget for {{categoryName}}? This action cannot be undone.",
        deleteButton: "Delete",
        invalidAmount: "Invalid Amount",
        pleaseEnterValidAmount: "Please enter a valid positive amount.",
        selectCategoryRequired: "Category Required",
        pleaseSelectCategory: "Please select a category for the budget.",
        budgetExistsForCategory: "Budget Exists",
        budgetAlreadyExistsForCategory:
          "A budget already exists for this category. Please edit the existing one.",
        budgetSaveSuccess: "Budget saved successfully!",
        budgetUpdateSuccess: "Budget updated successfully!",
        budgetDeleteSuccess: "Budget deleted successfully!",
        budgetSaveFailed: "Failed to save budget. Please try again.",
        budgetDeleteFailed: "Failed to delete budget. Please try again.",
        budgetCreatedNotificationTitle: "New Budget Set",
        budgetCreatedNotificationMessage:
          "A new budget of {{currencySymbol}}{{amount}} has been set for {{categoryName}}.",
        budgetUpdatedNotificationTitle: "Budget Updated",
        budgetUpdatedNotificationMessage:
          "The budget for {{categoryName}} has been updated to {{currencySymbol}}{{amount}}.",
        budgetDeletedNotificationTitle: "Budget Deleted",
        budgetDeletedNotificationMessage:
          "The budget for {{categoryName}} has been deleted.",
        budgetWarningTitle: "Budget Alert",
        budgetWarningMessageNearLimit:
          "You are near your budget limit for {{categoryName}}. Spent: {{currencySymbol}}{{spentAmount}} / Budgeted: {{currencySymbol}}{{budgetedAmount}}.",
        budgetWarningMessageOverLimit:
          "You have exceeded your budget for {{categoryName}}! Spent: {{currencySymbol}}{{spentAmount}} / Budgeted: {{currencySymbol}}{{budgetedAmount}}.",
        budgetActionFailedNotificationTitle: "Budget Action Failed",
        budgetActionFailedNotificationMessage:
          "Failed to perform a budget action: {{error}}.",
        activeBudgetTrackerTitle: "Active Budget Tracker",
        activeBudgetTrackerDescription:
          "Monitor your current active budgets and manage your financial goals.",
        activeBudgetsCount: "Active Budgets:",
        remainingBudgets: "Remaining: {{count}} budgets",
        limitReachedMessageSmall: "Limit Reached!",
        points: "Points",
        badges: "Badges",
        yourBadgesTitle: "Your Badges",
        viewAchievementsMessage: "View your earned achievements!",
        viewBudgetInsightsButton: "View Budget Insights 📊",
        monthlySpendingOverviewTitle: "Monthly Spending Overview",
        monthlySpendingOverviewDescription:
          "Track your current month's spending across categories, comparing it to your set budgets. Stay on top of your financial goals!",
        spent: "Spent",
        budgeted: "Budgeted", // Already present, but ensure it's there
        overBy: "Over by {{currencySymbol}}{{amount}}",
        remainingAmount: "Remaining: {{currencySymbol}}{{amount}}",
        yourCurrentBudgetsTitle: "Your Current Budgets",
        budgetFor: "📊 Budget for {{categoryName}}",
        noBudgetsOrSpendingData: "No budgets or spending data yet.",
        startYourFirstBudgetButton: "Start Your First Budget",
        noBudgetsYetCallToAction:
          "No budgets set yet. Budgets help you gain control over your spending and achieve your financial goals. Start your financial journey by creating your first budget!",
        createNewBudgetButton: "Create New Budget",
        updateYourBudgetTitle: "Update Your Budget",
        setUpYourBudgetTitle: "Set Up Your Budget",
        loadingData: "Loading data...",
        budgetAmountTitle: "Budget Amount",
        enterBudgetAmountPlaceholder: "Enter your budget amount",
        categoryTitle: "Category",
        selectCategoryPlaceholder: "Select Category",
        subcategoryTitle: "Subcategory",
        selectSubcategoryPlaceholder: "Select Subcategory",
        noSubcategoriesAvailable: "No Subcategories",
        startDateTitle: "Start Date",
        selectStartDatePlaceholder: "Select Start Date",
        endDateTitle: "End Date",
        selectEndDatePlaceholder: "Select End Date",
        calendarCancelButton: "Cancel",
        savingButton: "Saving...",
        saveBudgetButton: "Save Budget",
        updateBudgetButton: "Update Budget",
        cancelButton: "Cancel",
        fillAllFieldsErrorTitle: "Missing Information",
        fillAllFieldsErrorMessage:
          "Please fill in all required fields (Amount, Category, Start Date, End Date).",
        invalidAmountErrorTitle: "Invalid Amount",
        invalidAmountErrorMessage:
          "Please enter a valid positive number for your budget.",
        dateOrderErrorTitle: "Date Error",
        dateOrderErrorMessage: "Start date cannot be after end date.",
        budgetConflictErrorTitle: "Budget Conflict",
        budgetConflictErrorMessage:
          "A budget for this category/subcategory already exists or overlaps with the selected dates. Please update the existing budget instead, or choose different dates/category.",
        budgetUpdatedNotificationTitle: "Budget Updated", // Reusing this if already defined
        budgetCreatedNotificationTitle: "Budget Created", // Reusing this if already defined
        budgetUpdatedNotificationMessage:
          "Your budget has been updated successfully.",
        budgetCreatedNotificationMessage:
          "Your budget has been created successfully.",
        budgetedAmount: "Budgeted Amount",
        spentAmount: "Spent Amount",
        status: "Status",
        status_over: "Over Budget",
        status_under: "Under Budget",
        "status_on track": "On Track",
        updateBudgetTitle: "Update Budget",
        enterAmount: "Enter Amount",
        category: "Category",
        selectCategory: "Select a category",
        subcategory: "Subcategory",
        selectSubcategory: "Select a subcategory",
        fillAllFields: "Please fill all required fields.",
        updateSuccess: "Budget updated successfully!",
        updateError: "Failed to update budget.",
        confirmDeletionTitle: "Confirm Deletion",
        confirmDeletionMessage:
          "Are you sure you want to delete the budget for '{categoryName}'? This action cannot be undone.",
        budgetDeleteSuccess: "Budget deleted successfully!",
        budgetDeleteFailed: "Failed to delete budget: {error}",
        budgetDeletedNotificationTitle: "Budget Deleted",
        budgetDeletedNotificationMessage:
          "The budget for {categoryName} ({amount} {currencySymbol}) has been deleted.",
        budgetActionFailedNotificationTitle: "Budget Action Failed",
        budgetActionFailedNotificationMessage:
          "A budget action failed: {error}",
        budgetDetailsTitle: "Budget Details",
        loadingDetails: "Loading details...",
        noBudgetDataAvailable: "No budget data available.",
        budgetAmountTitle: "Budget Amount", // Reusing from setup modal, if applicable
        categoryTitle: "Category", // Reusing from setup modal, if applicable
        subcategoryTitle: "Subcategory", // Reusing from setup modal, if applicable
        startDateTitle: "Start Date", // Reusing from setup modal, if applicable
        endDateTitle: "End Date", // Reusing from setup modal, if applicable
        updateYourBudgetTitle: "Update Your Budget", // Reusing for the button
        setUpYourBudgetTitle: "Set Up Your Budget", // Reusing for the button
        noSubcategoriesAvailable:
          "No subcategories available for this category.",
      },
      account: {
        accountSettingsTitle: "Account Settings",
        guestUser: "Guest User",
        noEmailProvided: "No email provided",
        editProfile: "Edit Profile",
        applicationSettings: "Application Settings",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
        aboutUs: "About Us",
        helpCenter: "Help Center",
        logout: "Logout",
        logoutAlertTitle: "Confirm Logout",
        logoutAlertMessage: "Are you sure you want to log out?",
        cancelLogout: "Cancel",
        confirmLogout: "Logout",
        logoutErrorTitle: "Logout Error",
        loadingUserData: "Loading user data...",
        deleteAccount: "Delete Account",
        deleteAccountConfirmTitle: "Confirm Account Deletion",
        deleteAccountConfirmMessage:
          "Are you sure you want to request account deletion? This will permanently remove your account and all associated data. You will be redirected to your email app to send the request.",
        deleteAccountConfirmButton: "Yes, Delete My Account",
        linkOpenError:
          "Could not open the link. Please ensure you have a web browser or email client installed.",
      },
      manageData: {
        pageTitle: "Manage My Data",
        dataSummaryTitle: "Your Data Summary",
        totalReceiptsUploaded: "Total Receipts Uploaded",
        overallSpendingRecorded: "Overall Spending Recorded",
        lastReceiptUploaded: "Last Receipt Uploaded",
        dataActionsTitle: "Data Actions",
        exportMyDataButton: "Export My Data (CSV)",
        preparingDataButton: "Preparing Data...",
        exportSuccessTitle: "Success",
        exportSuccessMessage: "Your data has been prepared for sharing.",
        exportSharingUnavailable: "Sharing is not available on this device.",
        exportErrorTitle: "Error",
        exportErrorMessage: "Failed to export data. Please try again.",
        deleteMyAccountButton: "Delete My Account",
        deletingAccountButton: "Deleting Account...",
        deleteAccountAlertTitle: "Delete Account",
        deleteAccountAlertMessage:
          "Are you absolutely sure you want to delete your account? This action is irreversible and all your data will be lost.",
        cancelDelete: "Cancel",
        confirmDelete: "Delete",
        accountDeletedTitle: "Account Deleted",
        accountDeletedMessage:
          "Your account and all associated data have been permanently deleted.",
        deleteAccountErrorMessage: "Failed to delete account.",
        couldNotLoadSummary: "Could not load data summary.",
        loadingDataSummary: "Loading data summary...",
      },
      privacyPolicy: {
        pageTitle: "Privacy Policy",
        effectiveDate: "Effective Date: June 12, 2025",
        intro:
          'Welcome to O7! This Privacy Policy describes how O7 collects, uses, and discloses information about you when you use our mobile application (the "App").',

        section1Title: "1. Information We Collect",
        section1Content:
          "We collect information you provide directly to us when you use the App, such as when you create an account, upload receipts, or contact customer support. This includes:",
        section1List1:
          "Account Information: Your username, email address, and hashed password.",
        section1List2:
          "Receipt Data: Details from your uploaded receipts, including merchant name, date, total amount, items purchased, category, and payment method.",
        section1List3:
          "Communication Data: Information you provide when you communicate with us, such as feedback or support inquiries.",

        section2Title: "2. How We Use Your Information",
        section2Content: "We use the information we collect to:",
        section2List1:
          "Provide, maintain, and improve the App's features and functionality.",
        section2List2:
          "Process and manage your receipt uploads and spending data.",
        section2List3:
          "Provide you with personalized insights and analytics on your spending.",
        section2List4:
          "Communicate with you about your account, updates, and promotional offers.",
        section2List5:
          "Anonymize and aggregate data for research and analytics to improve our services.",

        section3Title: "3. Sharing Your Information",
        section3Content: "We may share your information as follows:",
        section3Subtitle1: "With Your Consent:",
        section3Desc1:
          "As explicitly stated during the receipt upload process, by uploading a receipt, you consent to us sharing certain anonymized and aggregated data derived from your receipts with third parties for market research and business analytics purposes. This data will not identify you personally.",
        section3Subtitle2: "Service Providers:",
        section3Desc2:
          "We may share information with third-party vendors, consultants, and other service providers who perform services on our behalf and require access to your information to carry out those services.",
        section3Subtitle3: "Legal Requirements:",
        section3Desc3:
          "We may disclose your information if required to do so by law or in the good faith belief that such action is necessary to comply with a legal obligation.",

        section4Title: "4. Data Security",
        section4Content:
          "We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no internet or email transmission is ever fully secure or error-free.",

        section5Title: "5. Your Choices",
        section5Content:
          'You can review and update your account information in your profile settings. You can also manage your data sharing preferences in the "Privacy Controls" section of the App Settings.',

        section6Title: "6. Changes to this Policy",
        section6Content:
          "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy in the App. You are advised to review this Privacy Policy periodically for any changes.",

        section7Title: "7. Contact Us",
        section7Content:
          "If you have any questions about this Privacy Policy, please contact us at: support@o7empower.com",
      },
      termsOfService: {
        pageTitle: "Terms of Service",
        lastUpdated: "Last Updated: June 12, 2025",
        intro:
          'Welcome to O7! These Terms of Service ("Terms") govern your use of the O7 mobile application (the "App") provided by O7 ("we," "us," or "our"). By accessing or using the App, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the App.',

        section1Title: "1. Account Registration",
        section1Content:
          "You must be at least 18 years old to create an account and use the App. When you register for an account, you agree to provide accurate, current, and complete information as prompted by our registration form. You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account.",

        section2Title: "2. Use of the App",
        section2Content1:
          "The App is designed to help you track your expenses by uploading and managing your receipts. You agree to use the App only for lawful purposes and in accordance with these Terms. You are prohibited from:",
        section2List1: "Using the App for any illegal or unauthorized purpose.",
        section2List2: "Uploading malicious software or data.",
        section2List3:
          "Attempting to interfere with the proper working of the App.",

        section3Title: "3. Intellectual Property",
        section3Content:
          "All content, features, and functionality of the App (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by O7, its licensors, or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.",

        section4Title: "4. User Data and Privacy",
        section4Content1:
          "By using the App and uploading receipts, you agree to the collection and use of your data as outlined in our Privacy Policy.",
        section4Content2:
          "This includes the anonymized and aggregated sharing of data derived from your receipts with third parties for market research and business analytics purposes, which is done with your explicit consent obtained during the receipt upload process.",

        section5Title: "5. Premium Features and Subscriptions",
        section5Content:
          "The App may offer premium features available through a subscription. All subscriptions are subject to these Terms and the terms of the respective app store (Apple App Store or Google Play Store). Payments are processed through the app store's in-app purchase mechanisms.",

        section6Title: "6. Disclaimers",
        section6Content:
          'The App is provided on an "as is" and "as available" basis, without any warranties of any kind, either express or implied. We do not warrant that the App will be uninterrupted, error-free, or free of viruses or other harmful components.',

        section7Title: "7. Limitation of Liability",
        section7Content:
          "In no event will O7, its affiliates, or their licensors, service providers, employees, agents, officers, or directors be liable for damages of any kind, under any legal theory, arising out of or in connection with your use, or inability to use, the App.",

        section8Title: "8. Governing Law",
        section8Content:
          "These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.",

        section9Title: "9. Changes to Terms",
        section9Content1:
          "We reserve the right to revise and update these Terms from time to time in our sole discretion. All changes are effective immediately when we post them.",
        section9Content2:
          "Your continued use of the App following the posting of revised Terms means that you accept and agree to the changes.",

        section10Title: "10. Contact Information",
        section10Content:
          "If you have any questions about these Terms, please contact us at: support@o7empower.com",
      },
      financialInsights: {
        pageTitle: "Financial Insights",
        getAdviceButton: "Get Financial Advice",
        generatingAdvice: "Generating advice...",
        noDataTitle: "No Data Yet",
        noDataMessage:
          "Upload some receipts and set up your wallet/budgets to get personalized insights!",
        adviceDisclaimer:
          "Disclaimer: This advice is generated by AI for informational purposes only and does not constitute professional financial advice. Always consult with a qualified financial advisor for personalized guidance.",
        adviceTitle: "Your Financial Advice:",
        lastUpdated: "Last generated:",
        adviceErrorTitle: "Advice Error",
        adviceErrorMessage:
          "Failed to get financial advice. Please try again later.",
        rateLimitedTitle: "Too Many Requests",
        rateLimitedMessage:
          "You've reached your free advice limit for today. Upgrade to Premium for unlimited insights!",
        upgradeToPremium: "Upgrade to Premium",
        loadingData: "Loading your financial data...",
        topSpendingCategories: "Top Spending ",
        walletBalance: "Wallet Balance",
        freeAdviceRemaining:
          "You have {{count}} out of {{max}} free advices remaining today.",
        freeAdviceExhausted: "Your free advices will reset tomorrow.",
        unlimitedAdvice: "Unlimited daily advice!",
        upgradeToPremiumShort: "Upgrade to Premium",
        frequentMerchantVisits: "Frequent Merchant Visits:",
        frequentItemPurchases: "Frequent Item Purchases:",
        contentBlockedMessage:
          "The financial advice could not be generated due to a content policy. Please try again or with different data. We aim to keep advice safe and helpful!",
        contentBlockedMessage:
          "تعذر إنشاء النصيحة المالية بسبب سياسة المحتوى. يرجى المحاولة مرة أخرى أو ببيانات مختلفة. نهدف إلى تقديم نصائح آمنة ومفيدة!",
      },
      appwriteErrors: {
        networkRequestFailed:
          "Network request failed. Please check your internet connection.",
        userExists:
          "A user with this email already exists. Please sign in or use a different email.",
        invalidCredentials: "Invalid email or password. Please try again.",
        userNotFound: "User not found. Please check your email or sign up.",
        sessionNotFound: "Your session has expired. Please log in again.",
        accountCreationFailed: "Account creation failed. Please try again.",
        signInFailed: "Failed to sign in. Please check your credentials.",
        passwordResetFailed:
          "Failed to send password reset email. Please try again later.",
        otpSendFailed: "Failed to send OTP. Please try again.",
        invalidOtp: "Invalid or expired OTP. Please try again.",
        documentNotFound: "The requested data could not be found.",
        permissionDenied: "You do not have permission to perform this action.",
        receiptSaveFailed: "Failed to save receipt. Please try again.",
        receiptEditFailed: "Failed to edit receipt. Please try again.",
        receiptUploadFailed:
          "Failed to upload receipt image. Please try again.",
        receiptDownloadUrlFailed: "Failed to get receipt image download URL.",
        userUpdateFailed:
          "Failed to update your profile data. Please try again.",
        budgetSaveFailed: "Failed to save budget. Please try again.",
        budgetFetchFailed: "Failed to fetch budget details.",
        notificationCreateFailed: "Failed to create notification.",
        notificationMarkReadFailed: "Failed to mark notification as read.",
        appSettingsFetchFailed:
          "Failed to load application settings. Using default values.",
        genericAppwriteError: "An Appwrite error occurred: {{message}}",
        invalidDocumentId: "Invalid document ID provided.",
        dataParsingError: "Failed to process data due to an invalid format.",
        receiptDeleteFailed: "Failed to delete receipt. Please try again.",
        budgetInitializationFailed: "Failed to check budget status.",
        categoryFetchFailed: "Failed to fetch categories.",
        pointsFetchFailed: "Failed to fetch user points.",
        badgesFetchFailed: "Failed to fetch user badges.",
        initialDataUploadFailed:
          "Failed to upload initial data. Please contact support.",
        dataParsingError: "Failed to process data due to an invalid format.",
        exportDataFailed: "Failed to export data. Please try again.",
        accountDeleteFailed: "Failed to delete account. Please try again.",
        exportSharingUnavailable: "Sharing is not available on this device.",
        walletDataLoadFailed: "Failed to load wallet data. Please try again.",
        walletTransactionSaveFailed:
          "Failed to save your wallet transaction. Please try again.",
        walletTransactionUpdateFailed:
          "Failed to update your wallet transaction. Please try again.",
        walletTransactionDeleteFailed:
          "Failed to delete your wallet transaction. Please try again.",

        receiptsFetchFailed:
          "Failed to fetch receipts for the specified period.",
        budgetInitializationFailed:
          "Failed to check budget initialization status.",
        categoryFetchFailed: "Failed to fetch categories. Please try again.",
        dataParsingError: "Failed to process data due to an invalid format.",
        exportDataFailed: "Failed to export data. Please try again.",
        accountDeleteFailed: "Failed to delete account. Please try again.",
        exportSharingUnavailable: "Sharing is not available on this device.",
        walletDataLoadFailed: "Failed to load wallet data. Please try again.",
        walletTransactionSaveFailed:
          "Failed to save your wallet transaction. Please try again.",
        walletTransactionUpdateFailed:
          "Failed to update your wallet transaction. Please try again.",
        walletTransactionDeleteFailed:
          "Failed to delete your wallet transaction. Please try again.",
        receiptsFetchFailed:
          "Failed to fetch receipts for the specified period.",
        budgetInitializationFailed:
          "Failed to check budget initialization status.",
        categoryFetchFailed: "Failed to fetch categories. Please try again.",
        userPreferencesSaveFailed:
          "Failed to save user preferences. Please try again.",
        sessionCheckFailed:
          "Failed to verify session or fetch user data. Please try logging in again.",
        documentNotFound: "The requested item was not found.",
        invalidParameters: "Invalid data provided.",
        unauthorized: "You are not authorized to perform this action.",
        forbidden: "Access denied. You do not have permission.",
        notFound: "The requested resource was not found.",
        conflict:
          "A conflict occurred. The item may already exist or there's a data mismatch.",
        tooManyRequests: "Too many requests. Please try again shortly.",
        internalServerError:
          "An internal server error occurred. Please try again later.",
        unknownError: "An unexpected error occurred. Please try again.",
        iapInitializationFailed:
          "Could not connect to the store. Please try again later.",
        purchaseCanceled: "You have canceled the purchase.",
        purchasePending: "Your purchase is pending. Please check back later.",
        purchaseFailedGeneric:
          "An error occurred during the purchase process. Please try again.",
        purchaseValidationFailed:
          "Purchase validation failed. Please contact support.",
        purchaseInitiationFailed:
          "Could not start the purchase. Please try again.",
        userPremiumUpdateFailed:
          "Failed to update your premium status. Please contact support.",
      },
      upgradePremium: {
        planChangeSuccess: "Your plan has been changed successfully!",
        currentPlan: "Current Plan",
        subscribe: "Subscribe",
        processing: "Processing...",
        getPremiumBenefitsTitle: "Get Premium Benefits",
        unlockPremiumFeatures: "Unlock Premium Features",
        loadingSubscriptions: "Loading subscription plans...",
        upgradeToPremiumTitle: "Upgrade to Premium",
        fetchProductsError: "Failed to load subscription plans: {{message}}",
        unlockPremiumBenefits: "Unlock Premium Benefits:",
        unlimitedReceipts: "Unlimited Receipt Uploads",
        customBudgets: "Custom Budget Categories & Tracking",
        cloudSync: "Secure Cloud Sync & Data Backup",
        addFree: "Ad-Free Experience",
        advancedSpendingAnalytics: "Advanced Spending Analytics",
        priorityCustomerSupport: "Priority Customer Support",
        introductoryOffer: "Try for {{price}} {{currency}} for {{period}}",
        chooseYourPlan: "Choose Your Plan",
        noSubscriptionPlansAvailable:
          "No subscription plans are currently available. Please try again later.",
        monthlyPlan: "Monthly Plan",
        yearlyPlan: "Yearly Plan",
        unknownPlan: "Unknown Plan",
        restorePurchases: "Restore Purchases",
        termsDisclaimer:
          "By subscribing, you agree to our Terms of Service and Privacy Policy. Subscriptions are managed through your device's app store settings.",
        purchaseSuccess:
          "Your premium subscription has been activated successfully!",
        purchaseFailedGeneric: "Purchase failed. Please try again.",
        purchaseNotAllowed:
          "Purchases are not allowed on this device or account.",
        paymentPending:
          "Your payment is pending. Your premium access will activate once the payment is confirmed.",
        productNotAvailable:
          "The selected product is not available for purchase.",
        purchaseInvalid: "This purchase is invalid for the selected product.",
        cannotFindProduct:
          "Could not find the selected product. Please try again later.",
        restoreSuccess:
          "Your previous purchases have been restored successfully!",
        noActivePurchasesFound:
          "No active purchases were found for your account.",
        restoreFailedGeneric: "Failed to restore purchases. Please try again.",
        networkError: "Network error. Please check your internet connection.",
        updateStatusError: "Failed to update premium status: {{message}}",
        loadingDetails: "Loading premium details...",
        goPremiumTitle: "Go Premium!",
        exportData: "Export Data to Excel/PDF",
        noAds: "No Ads (if applicable)",
        customBudgetCategories: "Custom Budget Categories",
        loadingPrice: "Loading Price...",
        priceNotAvailable: "Price not available",
        cancelAnytime: "Cancel anytime.",
        subscribingButton: "Subscribing...",
        subscribeNowButton: "Subscribe Now",
        alreadyPremiumTitle: "Already Premium",
        alreadyPremiumMessage: "You already have access to premium features!",
        congratulationsTitle: "Success!",
        congratulationsMessage:
          "Congratulations! You are now a Premium member. Enjoy unlimited features!",
        financialAdviceUnlimited: "Get Financial Advice Without Limitation",

        monthlySubscriptionLength: "1 month subscription",
        yearlySubscriptionLength: "1 year subscription",
        serviceDescription:
          "Unlock unlimited receipts, custom budgets, and advanced spending analytics.",
        alreadySubscribed: "You are already a premium subscriber.",
        subscriptionActive:
          "our subscription is active. Enjoy all the premium benefits!",
        youArePremium: "You are a Premium Member",
        manageSubscription: "Manage Subscription",
        nextRenewal: " Next Renewal",
        yourPlan: "Your Plan",
        copyDebugInfo: "Copy Information",
        subscriptionExpires: "Subscription expires on {expirationDate}.",
        resubscribe: "Re-subscribe",
        cancellationInitiatedTitle: "Cancellation Initiated",
        cancellationInitiatedMessage:
          "You have been redirected to the store to manage your subscription. Please note that it may take a few minutes for the cancellation status to update in the app.",
      },
      editProfile: {
        editProfileTitle: "Edit Profile",
        changeAvatar: "Change Avatar",
        username: "Username",
        enterUsername: "Enter your username",
        email: "Email",
        preferredCurrency: "Preferred Currency",
        currentPassword: "Current Password",
        enterCurrentPassword: "Enter your current password",
        newPassword: "New Password",
        enterNewPassword: "Enter new password (min 8 chars)",
        confirmNewPassword: "Confirm New Password",
        confirmNewPasswordPlaceholder: "Confirm your new password",
        saveChanges: "Save Changes",
        noChangesMade: "No changes were made.",
        saveSuccess: "Profile updated successfully!",
        permissionDeniedTitle: "Permission Denied",
        permissionDeniedMessage:
          "Permission to access media library was denied. Please enable it in settings to change your avatar.",
        imagePickerError: "Failed to pick image: {{message}}",
        passwordTooShort: "New password must be at least 8 characters long.",
        passwordsDoNotMatch: "New passwords do not match.",
        currentPasswordRequired:
          "Current password is required to change password.",
        incorrectCurrentPassword:
          "The current password you entered is incorrect.",
      },
      subscription: {
        loadingSubscriptions: "Loading subscription plans...",
        fetchProductsError: "Failed to load subscription plans: {{message}}",
        upgradeToPremiumTitle: "Upgrade to Premium",
        unlockPremiumBenefits: "Unlock Premium Benefits",
        unlimitedReceipts: "Unlimited Receipt Scans & Storage",
        advancedAnalytics: "Advanced Spending Analytics",
        prioritySupport: "Priority Customer Support",
        chooseYourPlan: "Choose Your Plan",
        noSubscriptionPlansAvailable:
          "No subscription plans are currently available. Please try again later.",
        monthlyPlan: "Monthly Plan",
        yearlyPlan: "Yearly Plan",
        restorePurchases: "Restore Purchases",
        termsDisclaimer:
          "By subscribing, you agree to our Terms of Service and Privacy Policy. Subscriptions automatically renew unless canceled.",
        purchaseError: "Purchase failed: {{message}}",
        purchaseSuccess: "Subscription successful! Premium features activated.",
        restoreSuccess: "Purchases restored successfully!",
        restoreNoPurchases: "No purchases found to restore.",
        restoreError: "Failed to restore purchases: {{message}}",
        updateStatusError: "Failed to update premium status: {{message}}",
      },
      budgetInsights: {
        title: "Budget Insights",
        monthYearFormat: "MMMM yyyy",
        loadingInsights: "Loading insights...",
        spendingByCategoryTitle: "Spending by Category ({{month}})",
        noSpendingData: "No spending data for {{month}}.",
        topCategoriesOverallTitle:
          "Top Categories Overall Spending (Last {{numMonths}} Months)",
        noTopCategoriesData: "No top categories spending data available.",
        monthlyBudgetPerformanceTitle:
          "Monthly Budget Performance (Last {{numMonths}} Months)",
        noMonthlyPerformanceData:
          "No monthly budget performance data available.",
        loadError: "Failed to load budget insights. Please try again.",
      },
      ads: {
        sponsored: "Sponsored",
        adErrorTitle: "Ad Error",
        adErrorMessage: "Could not load ad. Please try again later.",
        adLoadingTitle: "Loading Ad",
        adLoadingMessage: "Ad is loading, please wait...",
        adNotReadyTitle: "Ad Not Ready",
        adNotReadyMessage: "Ad is not ready yet. Please try again.",
        loadingAd: "Loading Ad...",
        earnExtraUpload: "Watch Ad for +1 Receipt Upload",
      },
      helpCenter: {
        pageTitle: "Help Center",
        intro:
          "Welcome to the ResynQ Help Center. Here you can find answers to common questions and resources to help you get the most out of your financial companion app.",
        faqTitle: "Frequently Asked Questions (FAQs)",
        gettingStartedTitle: "Getting Started",
        faq1Q: "How do I create an account?",
        faq1A:
          "You can create an account directly within the ResynQ app using your email address and a secure password. Follow the on-screen prompts during your first launch.",
        faq2Q: "What is ResynQ Premium?",
        faq2A:
          "ResynQ Premium offers unlimited receipt uploads, advanced analytics, custom budget categories, ad-free experience, and priority customer support. You can learn more and subscribe from the app's Wallet/Premium section.",
        receiptManagementTitle: "Receipt Scanning & Management",
        faq3Q: "How do I upload a receipt?",
        faq3A:
          "Tap the 'Upload' button (camera icon) at the bottom of the screen. You can then snap a photo of your receipt or select one from your device's gallery. Our AI will automatically extract the details.",
        faq4Q: "What if the AI makes a mistake?",
        faq4A:
          "You can easily edit any extracted receipt details within the app after it's processed. Simply tap on the transaction to make corrections.",
        faq5Q: "Can I download my receipts?",
        faq5A:
          "Yes, free users can download up to 3 receipts, while Premium users have unlimited downloads. Navigate to your receipts list and select the download option.",
        budgetingAnalyticsTitle: "Budgeting & Analytics",
        faq6Q: "How do I create a budget?",
        faq6A:
          "Go to the 'Budget' tab and tap the '+' icon to create a new budget. Free users can create up to 3 budgets, Premium users have unlimited custom budgets.",
        faq7Q: "How does ResynQ categorize my spending?",
        faq7A:
          "Our AI automatically categorizes your expenses based on merchant and item details. You can always re-categorize transactions manually if needed.",
        troubleshootingTitle: "Troubleshooting",
        troubleshootingIntro: "If you encounter any issues or bugs:",
        troubleshootingList1:
          "• Ensure your app is updated to the latest version.",
        troubleshootingList2: "• Check your internet connection.",
        troubleshootingList3: "• Restart the app.",
        troubleshootingList4:
          "• If the issue persists, please contact our support team.",
        contactSupportTitle: "Contact Support",
        contactSupportIntro:
          "If you can't find an answer to your question here or need further assistance, please reach out to our support team:",
        contactEmail: "By email: support@resynq.net",
        contactWebsite:
          "By visiting our support page: https://resynq.net/support.html",
        linkOpenError:
          "Could not open the link. Please ensure you have a web browser or email client installed.",
      },
      aboutUs: {
        pageTitle: "About Us",
        intro:
          "Welcome to ResynQ, your smart financial companion designed to simplify receipt management and empower you with insightful spending analytics. Our mission is to transform the way you interact with your finances, making it effortless to track expenses, manage budgets, and gain clarity on your financial health.\n\nWe believe that managing your money should be simple, intuitive, and secure. That's why we built ResynQ with advanced AI technology to automate the tedious task of data entry, allowing you to focus on what truly matters: understanding your spending habits and achieving your financial goals.",
        ourVisionTitle: "Our Vision",
        ourVisionContent:
          "To empower individuals worldwide with the tools and insights needed to achieve financial freedom and peace of mind, one receipt at a time.",
        ourCommitmentTitle: "Our Commitment",
        ourCommitmentList1:
          "• Innovation: Continuously improving our AI and features to provide the most efficient and accurate financial tools.",
        ourCommitmentList2:
          "• Security: Protecting your financial data with robust security measures and a privacy-first approach.",
        ourCommitmentList3:
          "• User Experience: Designing an intuitive and enjoyable app that makes financial management a breeze.",
        ourCommitmentList4:
          "• Transparency: Being clear about how we collect, use, and protect your information.",
        contactUsTitle: "Contact Us",
        contactUsIntro:
          "If you have any questions or feedback, please don't hesitate to reach out:",
        contactEmail: "By email: support@resynq.net",
        contactWebsite:
          "By visiting our support page: https://resynq.net/support.html",
        linkOpenError:
          "Could not open the link. Please ensure you have a web browser or email client installed.",
      },
      iap: {
        notAvailable: "In-app purchases are not available on this device.",
        productFetchError: "Failed to load subscription products",
        generalError: "An unexpected error occurred with in-app purchases",
        loadingProducts: "Loading subscription plans...",
        choosePlan: "Choose Your Premium Plan",
        noProductsFound: "No subscription plans found. Please try again later.",
        buyNow: "Buy Now",
        purchasing: "Purchasing...",
        purchaseFailed: "Purchase failed",
        purchaseSuccessTitle: "Purchase Successful!",
        purchaseSuccessMessage: "Your premium subscription has been activated.",
        validationFailed: "Purchase validation failed. Please contact support.",
        validationError:
          "There was an error validating your purchase. Please contact support.",
        purchaseCanceledTitle: "Purchase Canceled",
        purchaseCanceledMessage: "Your purchase was canceled.",
        purchaseDeferredTitle: "Purchase Deferred",
        purchaseDeferredMessage:
          "Your purchase is pending approval (e.g., parental approval). Please check back later.",
      },
    },
  },
  ar: {
    translation: {
      common: {
        hello: "مرحباً",
        save: "حفظ",
        cancel: "إلغاء",
        confirm: "تأكيد",
        ok: "موافق",
        close: "إغلاق",
        upgradeNow: "الترقية الآن",
        later: "لاحقاً",
        error: "خطأ",
        success: "نجاح",
        loading: "جاري التحميل...",
        somethingWentWrong: "حدث خطأ ما. الرجاء المحاولة مرة أخرى.",
        unlimited: "غير محدود",
        user: "مستخدم",
        dateFormatShort: "dd MMM, yyyy",
        not_available_short: "غير متوفر",
        dataLoadErrorTitle: "خطأ في تحميل البيانات",
        dataLoadErrorMessage: "فشل تحميل بعض البيانات. يرجى المحاولة مرة أخرى.",
        userOrAppSettingsNotLoaded:
          "لم يتم تحميل المستخدم أو إعدادات التطبيق. يرجى المحاولة مرة أخرى.",
        sharingNotAvailable: "المشاركة غير متاحة على نظامك.",
        yesDelete: "نعم، احذف",
        noCancel: "لا، إلغاء",
        languageChangeTitle: "تم تغيير اللغة",
        languageChangeMessageAppLayout: "تم تغيير اللغة بنجاح!",
        languageChangeMessage:
          "تم تغيير اللغة. لتطبيق كامل تغييرات اتجاه النص (من اليمين لليسار/من اليسار لليمين)، قد تتطلب بعض الأجهزة إعادة تشغيل التطبيق بالكامل.",
        monthNames: {
          // NEW for month name localization
          0: "يناير",
          1: "فبراير",
          2: "مارس",
          3: "أبريل",
          4: "مايو",
          5: "يونيو",
          6: "يوليو",
          7: "أغسطس",
          8: "سبتمبر",
          9: "أكتوبر",
          10: "نوفمبر",
          11: "ديسمبر",
        },
        currency_symbol_short: "ج.م", // Or "د.إ" or "ج.م" depending on your primary target currency symbol
        percentageSymbol: "٪",
        searching: "جاري البحث...",
        upload: "تحميل",
        exclamationMark: "!",
        errorTitle: "خطأ",
        successTitle: "نجاح",
        ok: "موافق",
        later: "لاحقًا",
        upgradeNow: "الترقية الآن",
        unknown: "غير معروف",
        unknownMerchant: "تاجر غير معروف",
        unknownLocation: "غير معروف",
        uncategorized: "غير مصنف",
        unnamedItem: "عنصر غير مسمى",
        not_available_short: "غير متوفر",
        cash: "نقدًا",
        unknownError: "خطأ غير معروف",
        percentageSymbol: "٪",
        dateFormatShort: "dd MMM, yyyy", // Keep dd MMM, yyyy
        dateFormatLong: "dd MMM, yyyy HH:mm",
        timeFormatShort: "hh:mm a", // Keep hh:mm a for AM/PM (or use HH:mm for 24-hour if preferred)
        cancel: "إلغاء",
        unknownMerchant: "تاجر غير معروف",
        currency_symbol_short: "ج.م", // or whatever your Arabic currency symbol is
        deleting: "جاري الحذف...",
        downloading: "جاري التحميل...",
        unknownError: "خطأ غير معروف",
        unnamedItem: "عنصر غير مسمى",
        notAvailableShort: "غير متاح",
        currency_symbol_short: "ج.م",
        close: "إغلاق",
        dayShortSun: "أحد",
        dayShortMon: "اثنين",
        dayShortTue: "ثلاثاء",
        dayShortWed: "أربعاء",
        dayShortThu: "خميس",
        dayShortFri: "جمعة",
        dayShortSat: "سبت",
        dayLongSun: "الأحد",
        dayLongMon: "الاثنين",
        dayLongTue: "الثلاثاء",
        dayLongWed: "الأربعاء",
        dayLongThu: "الخميس",
        dayLongFri: "الجمعة",
        dayLongSat: "السبت",
        success: "نجاح",
        failed: "فشل",
        upgradeToPremium: "الترقية إلى بريميوم",
        userOrSettingsNotLoaded:
          "لم يتم تحميل إعدادات المستخدم أو التطبيق. الرجاء المحاولة مرة أخرى.",
        view: "عرض",
        failedToLoadData: "فشل تحميل البيانات. الرجاء المحاولة مرة أخرى.",
        failedToLoadSubcategories: "فشل تحميل الفئات الفرعية.",
        failedToSaveBudget: "فشل حفظ الميزانية. الرجاء المحاولة مرة أخرى.",
        success: "نجاح",
        failed: "فشل",
        search: "بحث",
        back: "رجوع",
        loading: "جاري التحميل...",
        error: "خطأ",
        success: "نجاح",
        cancel: "إلغاء",
        unlimited: "غير محدود",
        id: "المعرف",
        date: "التاريخ",
        merchant: "التاجر",
        total: "الإجمالي",
        category: "الفئة",
        subcategory: "الفئة الفرعية",
        items: "العناصر",
        viewDetails: "عرض التفاصيل",
        update: "تعديل",
        delete: "حذف",
        cancel: "إلغاء",
        success: "نجاح",
        error: "خطأ",
        notApplicable: "غير متاح",
        notifications: "الإشعارات",
        close: "إغلاق",
        infoTitle: "معلومات",
        errorTitle: "خطأ",
        successTitle: "نجاح",
        infoTitle: "معلومات",
        invalidEmailTitle: "بريد إلكتروني غير صالح",
        loginFailedTitle: "فشل تسجيل الدخول",
        unexpectedError: "حدث خطأ غير متوقع.",
        errorTitle: "خطأ",
        invalidEmailTitle: "بريد إلكتروني غير صالح",
        unknownError: "حدث خطأ غير متوقع.",
        privacyPolicy: "سياسة الخصوصية",
        termsOfService: "شروط الخدمة",
        and: "و",
        unknownError: "حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.",
        invalidAmount: "مبلغ غير صالح",
        missingType: "النوع مفقود",
        authenticationError: "خطأ في المصادقة",
        success: "نجاح",
        userOrSettingsNotLoaded:
          "لم يتم تحميل المستخدم أو إعدادات التطبيق. الرجاء المحاولة مرة أخرى.",
        unknownCategory: "فئة غير معروفة",
        later: "لاحقاً",
        upgradeNow: "الترقية الآن",
        unlimited: "غير محدود",
        loading: "جاري التحميل...",
        back: "رجوع",
        success: "نجاح!",
        error: "خطأ",
        searching: "جاري البحث...",
        upload: "تحميل",
        currencyPreference: "تفضيل العملة",
        selectCurrency: "اختر العملة",
        searchCurrency: "البحث عن العملة...",
        selectPreferredCurrency: "اختر العملة المفضلة",
        amount: "المبلغ",
        month: "الشهر",
        back: "رجوع",
        category: "الفئة",
        spent: "المنفق",
        budgeted: "الميزانية",
        remaining: "المتبقي",
        month: "الشهر",
        totalSpent: "إجمالي المنفق",
        surplusDeficit: "الفائض/العجز",
        unknownCategory: "فئة غير معروفة",
        errorTitle: "خطأ",
        successTitle: "نجاح",
        ok: "موافق",
        cancel: "إلغاء",
        save: "حفظ",
        delete: "حذف",
        confirm: "تأكيد",
        loading: "جاري التحميل...",
        unknown: "غير معروف",
        yes: "نعم",
        no: "لا",
        week: "أسبوع",
        weeks: "أسابيع",
        noInternetTitle: "لا يوجد اتصال بالإنترنت",
        noInternetMessage: "يرجى التحقق من إعدادات الشبكة والمحاولة مرة أخرى.",
      },
      onboarding: {
        heroText: "إدارة الإيصالات مملة وغالبًا ما تُفقد ويصعب تتبعها.",
        feature1: "🔥 التقط وحمل إيصالاتك بسهولة.",
        feature2: "🔥 دع الذكاء الاصطناعي يتولى التخزين والمعالجة لك.",
        feature3: "🔥 وداعاً لمتاعب حفظ السجلات اليدوية.",
        feature4: "🔥 لا تتم مشاركة أي معلومات شخصية أبدًا.",
        slogan: "O7 يمكّن أفضل الحلول",
        continueWithMail: "المتابعة بالبريد الإلكتروني",
      },
      auth: {
        accessAccount: "الوصول إلى حسابك",
        emailAddress: " البريد الإلكتروني",
        enterEmailPlaceholder: "your@example.com",
        password: "كلمة المرور",
        enterPasswordPlaceholder: "أدخل كلمة المرور الخاصة بك",
        forgotPassword: "هل نسيت كلمة المرور؟",
        signInButton: "تسجيل الدخول",
        noAccountQuestion: "ليس لديك حساب؟",
        signUpLink: "التسجيل",
        fillAllFieldsError: "الرجاء تعبئة جميع الحقول.",
        invalidEmailError: "الرجاء إدخال عنوان بريد إلكتروني صالح.",
        loginFailedMessage: "حدث خطأ غير متوقع أثناء تسجيل الدخول.",
        passwordResetSuccessTitle: "إعادة تعيين كلمة المرور",
        passwordResetSuccessMessage:
          "تم إرسال رابط إعادة تعيين كلمة المرور إلى عنوان بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك (ومجلد البريد العشوائي).",
        passwordResetFailedMessage: "فشل إرسال بريد إعادة تعيين كلمة المرور.",
        otpSentSuccessMessage: "تم إرسال رمز التحقق إلى بريدك الإلكتروني.",
        resetPasswordTitle: "إعادة تعيين كلمة المرور",
        enterEmailInstruction: "أدخل عنوان بريدك الإلكتروني",
        sendEmailButton: "إرسال البريد الإلكتروني",
        cancelButton: "إلغاء",
        registerAccount: "التسجيل في حساب O7",
        username: "اسم المستخدم",
        enterUsernamePlaceholder: "اسم المستخدم الفريد الخاص بك",
        emailAddress: "عنوان البريد الإلكتروني",
        enterEmailPlaceholder: "your@example.com",
        password: "كلمة المرور",
        enterPasswordPlaceholderShort: "8 أحرف كحد أدنى",
        confirmPassword: "تأكيد كلمة المرور",
        reenterPasswordPlaceholder: "أعد إدخال كلمة المرور الخاصة بك",
        agreeToTermsPrefix: "أوافق على ",
        agreeToTermsSuffix: " للتطبيق.",
        signUpButton: "التسجيل",
        haveAccountQuestion: "هل لديك حساب بالفعل؟",
        signInLink: "تسجيل الدخول",
        fillAllFieldsError: "الرجاء تعبئة جميع الحقول.",
        invalidEmailError: "الرجاء إدخال عنوان بريد إلكتروني صالح.",
        passwordsMismatchError: "كلمات المرور غير متطابقة.",
        passwordLengthError: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
        agreeTermsError: "يجب أن توافق على شروط الخدمة وسياسة الخصوصية.",
        passwordResetGenericConfirmation:
          "إذا كان هناك حساب مرتبط بهذا البريد الإلكتروني، فقد تم إرسال رابط إعادة تعيين كلمة المرور إليه. يرجى التحقق من صندوق الوارد الخاص بك (ومجلد الرسائل غير المرغوب فيها).",
      },
      aiMessages: {
        // Update this line with the correct Arabic translation for the exact English message
        notAReceiptDefault: "لا يبدو أن هذه الصورة إيصال.", // Corrected Arabic translation
        imageQualityTooLow:
          "جودة الصورة منخفضة جداً. الرجاء المحاولة بصورة أوضح.",
        noTextDetected:
          "لم يتم الكشف عن أي نص قابل للقراءة في الصورة. الرجاء التأكد من وضوح الإيصال.",
        couldNotProcessImage:
          "واجهنا مشكلة في معالجة هذه الصورة. الرجاء المحاولة مرة أخرى أو بإيصال مختلف.",
        noItemsFound: "لم يتم العثور على أي عناصر في الإيصال.",
        missingMerchantName: "تعذر التعرف على اسم التاجر.",
        geminiEmptyResponse:
          "فشل استخراج أو اكتشاف الإيصال. يرجى المحاولة مرة أخرى. التفاصيل.",
        genericAiError:
          "حدث خطأ غير متوقع أثناء معالجة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى. التفاصيل: {{message}}",
        modelOverloaded:
          "نموذج الذكاء الاصطناعي محمل حاليًا. يرجى المحاولة مرة أخرى بعد قليل.",
        // ... any other Arabic aiMessages keys
      },
      receiptProcess: {
        // مساحة اسم جديدة
        userSettingsError:
          "لم يتم تحميل إعدادات المستخدم أو التطبيق. الرجاء المحاولة مرة أخرى.",
        limitReachedTitle: "تم الوصول إلى الحد الأقصى!",
        limitReachedMessage:
          "لقد وصلت إلى الحد الشهري المسموح به لـ {{freeLimit}} من تحميل الإيصالات. قم بالترقية إلى Premium للحصول على تحميلات غير محدودة وميزات إضافية!",
        notAReceiptTitle: "ليست إيصالاً",
        notAReceiptMessage: "هذه الصورة ليست إيصالاً.",
        processedSuccess: "تم معالجة الإيصال بنجاح!",
        consentRequiredTitle: "الموافقة مطلوبة",
        consentRequiredMessage: "يرجى الموافقة على حفظ بياناتك قبل المتابعة.",
        missingData: "بيانات الإيصال أو الصورة أو معلومات المستخدم مفقودة.",
        duplicateTitle: "إيصال مكرر",
        duplicateMessage:
          "هذا الإيصال لـ {{merchant}} بتاريخ {{date}} موجود بالفعل ولن يتم حفظه مرة أخرى.",
        savedSuccess: "تم حفظ الإيصال بنجاح!",
        savedPartialSuccess:
          "تم حفظ الإيصال، ولكن قد تكون هناك حاجة لتحديث كامل للمستخدم.",
        saveFailed: "لم يتم حفظ الإيصال. الرجاء المحاولة مرة أخرى.",
        generalSaveError: "تعذر حفظ الإيصال.",
        savingReceipt: "♥️ جاري حفظ إيصالك",
        extractedSuccess: "تم استخراج الإيصال بنجاح",
        tapToViewFull: "انقر للعرض كاملاً",
        processingMessage:
          "جاري المعالجة...\nتستخدم منصتنا الذكاء الاصطناعي المتقدم لاستخراج التفاصيل الرئيسية تلقائياً من إيصالك المحمل.",
        merchant: "التاجر",
        location: "الموقع",
        date: "التاريخ",
        category: "الفئة",
        items: "العناصر",
        showLess: "(▲ إظهار أقل)",
        showMore: "(إظهار المزيد ▼)",
        unnamedItem: "عنصر غير مسمى",
        hideItemsShowDetails: "▲ إخفاء العناصر وعرض التفاصيل",
        showAllItems: "▼ عرض جميع العناصر",
        subtotal: "المجموع الفرعي",
        vat: "ضريبة القيمة المضافة",
        total: "الإجمالي",
        consentMessage:
          "بالموافقة على الحفظ، فإنك توافق على استخدام بياناتك لتحسين نماذج الذكاء الاصطناعي الخاصة بنا مع الحفاظ على خصوصيتك.",
        save: "حفظ",
        saving: "جاري الحفظ...",
        process: "معالجة",
        cancel: "إلغاء",
        dataSavingSecurely: "بياناتك يتم حفظها بأمان...",
        pleaseWaitProcessing: "الرجاء الانتظار بينما نقوم بمعالجة طلبك.",
        generalProcessingError:
          "فشل معالجة بيانات الإيصال. يرجى التأكد من أن الصورة واضحة والمحاولة مرة أخرى.",
        aiProcessingErrorTitle: "خطأ في معالجة الذكاء الاصطناعي",
      },
      editReceipt: {
        editReceipt: "تعديل الفاتورة",
        errorMissingData: "بيانات الفاتورة مفقودة. لا يمكن الحفظ.",
        errorMerchantEmpty: "اسم التاجر لا يمكن أن يكون فارغًا.",
        errorTotalInvalid: "المجموع يجب أن يكون رقمًا موجبًا صالحًا.",
        saveSuccess: "تم تحديث الفاتورة بنجاح!",
        saveFailed: "فشل الحفظ: {{message}}",
        saveFailedAlert: "فشل حفظ الفاتورة: {{message}}",
        merchantName: "اسم التاجر",
        enterMerchantName: "أدخل اسم التاجر",
        totalAmount: "المبلغ الإجمالي",
        enterTotalAmount: "أدخل المبلغ الإجمالي",
        itemsReadOnly: "العناصر (للقراءة فقط)",
        saveChanges: "حفظ التغييرات",
        noChangesMade: "لم يتم إجراء أي تغييرات على الإيصال.",
      },
      receiptDetails: {
        title: "تفاصيل الفاتورة",
        // ... other keys for this modal
      },
      categories: {
        foodDining: "طعام ومطاعم",
        transportation: "مواصلات",
        shopping: "تسوق",
        healthWellness: "صحة وعافية",
        billsUtilities: "فواتير ومرافق",
        entertainmentLeisure: "ترفيه وأنشطة ترفيهية",
        businessExpenses: "مصاريف عمل",
        education: "تعليم",
        financialServices: "خدمات مالية",
        giftsDonations: "هدايا وتبرعات",
        homeImprovement: "تحسين المنزل",
        miscellaneous: "متنوعة",
        householdItems: "لوازم منزلية",
        clothing: "ملابس",
      },
      subcategories: {
        restaurants: "مطاعم",
        groceries: "بقالة",
        cafes: "مقاهي",
        fastFood: "وجبات سريعة",
        bars: "حانات",
        delivery: "توصيل",

        // فئات المواصلات الفرعية
        fuel: "وقود",
        publicTransport: "مواصلات عامة",
        taxiRideshare: "تاكسي/مشاركة ركوب",
        parking: "مواقف",
        vehicleMaintenance: "صيانة المركبات",
        tolls: "رسوم عبور",

        // فئات التسوق الفرعية
        clothing: "ملابس",
        electronics: "إلكترونيات",
        householdItems: "أدوات منزلية",
        personalCare: "عناية شخصية",
        onlineShopping: "تسوق عبر الإنترنت",
        books: "كتب",
        furniture: "أثاث",

        // فئات الصحة والعافية الفرعية
        pharmacy: "صيدلية",
        doctorVisits: "زيارات الطبيب",
        fitness: "لياقة بدنية",
        insurance: "تأمين",
        dentalCare: "عناية بالأسنان",
        visionCare: "عناية بالعيون",

        // فئات الفواتير والمرافق الفرعية
        electricity: "كهرباء",
        water: "ماء",
        internet: "إنترنت",
        mobile: "هاتف محمول",
        rentMortgage: "إيجار/قرض عقاري",
        subscriptionServices: "خدمات اشتراك",
        cableTv: "تلفزيون الكابل",

        // فئات الترفيه والأنشطة الترفيهية الفرعية
        movies: "أفلام",
        concerts: "حفلات موسيقية",
        events: "فعاليات",
        hobbies: "هوايات",
        travel: "سفر",
        streamingServices: "خدمات بث",
        sports: "رياضة",

        // فئات مصاريف العمل الفرعية
        officeSupplies: "لوازم مكتبية",
        businessTravel: "سفر عمل",
        clientMeals: "وجبات عملاء",
        subscriptions: "اشتراكات",
        software: "برمجيات",
        advertising: "إعلانات",
        training: "تدريب",

        // فئات التعليم الفرعية
        tuitionFees: "رسوم دراسية",
        educationBooks: "كتب",
        courses: "دورات",
        schoolSupplies: "لوازم مدرسية",
        studentLoans: "قروض الطلاب",

        // فئات الخدمات المالية الفرعية
        bankFees: "رسوم بنكية",
        loanPayments: "دفعات قروض",
        investments: "استثمارات",
        insurancePremiums: "أقساط تأمين",
        creditCardFees: "رسوم بطاقة ائتمان",

        // فئات الهدايا والتبرعات الفرعية
        charitableDonations: "تبرعات خيرية",
        gifts: "هدايا",
        fundraisingEvents: "فعاليات جمع التبرعات",

        // فئات تحسين المنزل الفرعية
        plumbing: "سباكة",
        electrician: "كهربائي",
        gardening: "بستنة",
      },
      home: {
        welcome: "أهلاً بك",
        myReceipts: "إيصالاتي",
        uploadNewReceipt: "تحميل إيصال جديد",
        receiptOptions: "خيارات الإيصال",
        viewReceipt: "عرض الإيصال",
        editReceipt: "تعديل الإيصال",
        downloadReceipt: "تنزيل الإيصال",
        deleteReceipt: "حذف الإيصال",
        noReceipts: "لا توجد إيصالات لعرضها.",
        uploadFirstReceipt: "قم بتحميل إيصالك الأول لمشاهدته هنا!",
        monthlyUsageTracker: "متعقب الاستخدام الشهري",
        receiptsUploaded: "الإيصالات التي تم تحميلها",
        receiptsRemaining: "المتبقي",
        downloadsUsed: "التنزيلات المستخدمة",
        downloadsRemaining: "المتبقي",
        limitReached: "تم الوصول إلى الحد الأقصى!",
        upgradeForUnlimited: "الترقية إلى بريميوم للحصول على ميزات غير محدودة!",
        goodMorning: "صباح الخير",
        goodAfternoon: "مساء الخير",
        goodEvening: "مساء الخير",
        unknownCategory: "فئة غير معروفة",
        initialDataUploadError: "خطأ في تحميل البيانات الأولية.",
        loadingDashboard: "جاري تحميل لوحة التحكم الخاصة بك...",
        noMerchantData: "لا توجد بيانات تاجر لهذه الفئة.",
        merchant: "التاجر",
        total: "الإجمالي",
        visits: "الزيارات",
        noSpendingData: "لا توجد بيانات إنفاق متاحة.",
        noMonthlySpendingData: "لا توجد بيانات إنفاق شهرية لهذه الفئة.",
        merchantAnalysisForCategory: "تحليل التاجر لفئة {{category}}",
        searchingReceipts: "جاري البحث عن الإيصالات...",
        noResultsFound: "لا توجد نتائج.",
        monthlySpendingOverview: "نظرة عامة على الإنفاق الشهري",
        spendingTrends: "اتجاهات الإنفاق",
        spendingTrendsTitle: "اتجاهات الإنفاق (آخر 6 أشهر)",
        unknownMerchant: "تاجر غير معروف",
        monthlyReceiptsUploads: "الإيصالات الشهرية المرفوعة", // Arabic for Monthly Receipts Uploads
        monthlyReceiptsDownloads: "الإيصالات الشهرية المحملة", // Arabic for Monthly Receipts Downloads
        receiptsOnMonth: "إيصالات شهر {{monthName}}", // NEW
        monthSpending: "إنفاق شهر {{monthName}}", // NEW
        lastReceiptDate: "تاريخ آخر إيصال", // NEW
        spendingCategoriesOf: "تصنيفات المصروفات لشهر", // NEW
        viewDetailsPrompt: "👇 عرض التفاصيل 👇", // NEW
        noSpendingDataAvailable: "لا توجد بيانات إنفاق متاحة.", // NEW
        spendingTrendsTitle: "اتجاهات الإنفاق (آخر 6 أشهر)", // This should already be there from previous updates
        loadingSpendingTrends: "جاري تحميل اتجاهات الإنفاق...", // NEW
        noSpendingTrendsData:
          "لا توجد بيانات إنفاق متاحة لعرض الاتجاهات للعام الحالي.", // NEW
        spendingTrendsCurrentYear: "اتجاهات الإنفاق (السنة الحالية)", // NEW
        spendingTrendsDescription:
          "شاهد أنماط إنفاقك الإجمالية بمرور الوقت، مع عرض إجمالي المصروفات شهريًا للعام الحالي.",

        topSpendingInsightOf: "أبرز رؤى الإنفاق لشهر", // NEW
        spendingInsightDescription:
          "يتم احتساب ذلك بناءً على أسعار العناصر الفردية في إيصالاتك، قبل تطبيق أي خصومات أو ضريبة القيمة المضافة أو رسوم خدمة أخرى.",
        searchFilterTitle: "بحث وتصفية",
        searchResults: "نتائج البحث",
        latestUploadedReceipts: "آخر الإيصالات المرفوعة",
        noSearchResults:
          "لم يتم العثور على إيصالات مطابقة لمعايير البحث الخاصة بك.",
        noReceiptsUploadedYet: "✨ لم يتم تحميل أي إيصالات بعد. لنبدأ! ✨",
        detailsTitle: " تفاصيل", // For "اسم الفئة تفاصيل"
        totalSpending: "الإجمالي",
        merchantBreakdownTitle: "توزيع التجار",
        merchantSpendingDescription:
          "يتم احتساب أرقام إنفاق التجار بناءً على أسعار العناصر الفردية في إيصالاتك، قبل تطبيق أي خصومات أو ضريبة القيمة المضافة أو رسوم خدمة أخرى.",
        receiptOptions: "خيارات الفاتورة",
        viewDetails: "عرض التفاصيل",
        editReceipt: "تعديل الايصال",
        downloadImage: "تحميل الايصال",
        deleteReceipt: "حذف الايصال",
        unlimitedAdviceTitle: "نصائحك المالية غير المحدودة في انتظارك!",
        newAdviceAvailableTitle: "نصيحة مالية جديدة متاحة!",
        freeAdviceRemainingHome: "لديك {{count}} نصيحة مجانية متبقية اليوم.",
        checkYourAdvice: "تحقق من نصيحتك اليومية",
        upgradeToUnlimited: "الترقية للحصول على نصائح غير محدودة",
        noAdviceYet: "   أحصل على أول نصيحة مالية اليوم",
        welcome: "أهلاً بك",
        wizoDescriptionPart1:
          "🔥 ResynQ هو رفيقك المالي الشخصي الذي يحول إيصالاتك اليومية إلى رؤى قوية. التقط صورة، ويستخرج ويزو على الفور البيانات الرئيسية — مثل التجار، والمبالغ الإجمالية، والعناصر — حتى تتمكن من تتبع إنفاقك، والبقاء ضمن الميزانية، وفهم أين تذهب أموالك حقًا.",
        wizoDescriptionPart2:
          "🔥 لكن ResynQ لا يتوقف عند مساعدة المستخدمين — بل يساعد الشركات أيضًا على اتخاذ قرارات أكثر ذكاءً. من خلال بيانات الإنفاق المجهولة والموافق عليها من المستخدمين، يقدم ويزو رؤى سوقية قيمة للعلامات التجارية وتجار التجزئة. إنه فوز للجميع: يكتسب المستخدمون السيطرة على أموالهم، بينما تحصل الشركات على أدوات أفضل لخدمة عملائها.",
        wizoDescriptionPart3:
          "🔥 تتبع النفقات بسهولة، واكتسب رؤى حول عادات إنفاقك، وحقق أهدافك المالية بكل سهولة!",
        searchPlaceholder: "البحث باسم التاجر...",
        filterButton: "الفلاتر",
        clearSearch: "مسح",
        filterModalTitle: "تصفية الإيصالات",
        applyFiltersButton: "تطبيق الفلاتر",
        clearFiltersButton: "مسح جميع الفلاتر",
        noSearchResults: "لم يتم العثور على إيصالات مطابقة لمعايير البحث.",
        fromDate: "من تاريخ",
        toDate: "إلى تاريخ",
        selectCategory: "اختر الفئة",
        selectSubcategory: "اختر الفئة الفرعية",
        noSubcategoriesAvailable: "لا توجد فئات فرعية متاحة",
        selectDate: "اختر التاريخ",
        cancel: "إلغاء",
        ok: "موافق",
        merchantName: "اسم التاجر", // NEW: For the merchant search input label
        endDateBeforeStartDateError:
          "تاريخ النهاية لا يمكن أن يكون قبل تاريخ البداية.",
        fromDate: "من تاريخ",
        toDate: "إلى تاريخ",
        selectDate: "اختر التاريخ",
        closeCalendar: "إغلاق التقويم",
        applyFiltersButton: "تطبيق الفلاتر",
        clearFiltersButton: "مسح جميع الفلاتر",
        searchResults: "نتائج البحث",
        latestUploadedReceipts: "أحدث الإيصالات المحملة",
        receiptOptions: "خيارات الإيصال",
        viewDetails: "عرض التفاصيل",
        editReceipt: "تعديل الإيصال",
        downloadImage: "تحميل الصورة",
        downloading: "جاري التحميل...",
        imageDownloadSuccessWeb: "تم فتح الصورة في علامة تبويب جديدة.",
        imageDownloadSuccessMobile: "تم تحميل ومشاركة الصورة بنجاح!",
        confirmDeleteTitle: "تأكيد الحذف",
        confirmDeleteMessage:
          "هل أنت متأكد أنك تريد حذف هذا الإيصال؟ لا يمكن التراجع عن هذا الإجراء.",
        deleteButton: "حذف",
        receiptDeleteSuccess: "تم حذف الإيصال بنجاح!",
        receiptDeletedNotificationTitle: "تم حذف الإيصال",
        receiptDeletedNotificationMessage:
          "تم حذف الإيصال الخاص بـ {merchant} ({amount}{currencySymbol}).",
        receiptDeleteFailedNotificationTitle: "فشل حذف الإيصال",
        receiptDeleteFailedNotificationMessage: "فشل حذف الإيصال: {error}",
        spendingDetailsFor: "تفاصيل الإنفاق لـ {category}",
        spendingDetails: "تفاصيل الإنفاق",
        merchant: "التاجر",
        total: "الإجمالي",
        visits: "الزيارات",
        noMerchantData: "لا توجد بيانات تجار متاحة لهذه الفئة.",
        searchResults: "نتائج البحث",
        latestUploadedReceipts: "أحدث الإيصالات المحملة",
        noSearchResults: "لم يتم العثور على إيصالات مطابقة لمعاييرك.",
        noReceiptsUploadedYet:
          "لم يتم تحميل أي إيصالات بعد. ابدأ بإضافة أول إيصال لك!",
        unknownMerchant: "تاجر غير معروف",
        searchPlaceholder: "البحث باسم التاجر...",
        openFilter: "فتح التصفية",
        filtersActive: "الفلاتر نشطة",
        premiumUser: "مستخدم مميز",
      },
      notifications: {
        receiptViewed: "تم عرض الإيصال",
        receiptDownloaded: "تم تنزيل ومشاركة الإيصال",
        receiptDeleted: "تم حذف الإيصال",
        receiptEdited: "تم تعديل الإيصال",
        budgetDeleted: "تم حذف الميزانية",
        downloadLimitReached: "تم الوصول إلى حد التنزيل",
        budgetLimitReachedNotification: "تم الوصول إلى حد الميزانية",
        receiptViewedMessage: "لقد شاهدت إيصال {{merchant}} بتاريخ {{date}}.",
        downloadLimitReachedMessage:
          "لقد وصلت إلى حدك الشهري لتنزيل الإيصالات وهو {{limit}}. قم بالترقية إلى بريميوم للحصول على تنزيلات غير محدودة والمزيد من الميزات!",
        downloadLimitNotificationMessage:
          "لقد استخدمت جميع تنزيلات الإيصالات الشهرية المجانية البالغة {{limit}}. قم بالترقية إلى بريميوم!",
        receiptDownloadedMessage:
          "تم تنزيل ومشاركة إيصال {{merchant}} بتاريخ {{date}} بنجاح!",
        receiptDeletedMessage: "لقد حذفت إيصال {{merchant}} بتاريخ {{date}}.",
        receiptEditedMessage:
          "لقد قمت بتعديل إيصال {{merchant}} بتاريخ {{date}}.",
        receiptUploadLimitReachedTitle: "تم الوصول إلى حد تحميل الإيصالات",
        receiptUploadLimitReachedMessage:
          "لقد استخدمت جميع {{freeLimit}} من تحميلات الإيصالات المجانية الشهرية. قم بالترقية إلى Premium!",
        duplicateReceiptDetectedTitle: "تم الكشف عن إيصال مكرر",
        duplicateReceiptDetectedMessage:
          "إيصالك لـ {{merchant}} بتاريخ {{date}} كان مكرراً ولم يتم حفظه.",
        receiptProcessedTitle: "تمت معالجة الإيصال",
        receiptProcessedMessage:
          "تم معالجة إيصالك لـ {{merchant}} ({{total}}) بنجاح!",
        achievementUnlockedTitle: "تم فتح إنجاز!",
        achievementUnlockedMessage:
          "لقد حصلت على شارات جديدة: {{badgeNames}}! وربحت نقاطًا إضافية: {{pointsExtra}}!",
        receiptSaveFailedTitle: "فشل حفظ الإيصال",
        receiptSaveFailedMessage:
          "فشل حفظ إيصالك لـ {{merchant}}. الرجاء المحاولة مرة أخرى.",
        receiptProcessingErrorTitle: "خطأ في معالجة الإيصال",
        receiptProcessingErrorMessage:
          "حدث خطأ غير متوقع أثناء حفظ إيصالك. الخطأ: {{errorMessage}}.",
        duplicateReceiptDetectedTitle: "تم الكشف عن إيصال مكرر",
        duplicateReceiptDetectedMessage:
          "إيصالك لـ {{merchant}} بتاريخ {{date}} كان مكرراً ولم يتم حفظه.",
        achievementUnlockedTitle: "تم فتح إنجاز!",
        achievementUnlockedMessage:
          "لقد حصلت على شارات جديدة: {{badgeNames}}! وربحت نقاطًا إضافية: {{pointsExtra}}!",
        achievementUnlockedTitle: "تم فتح إنجاز!",
        achievementUnlockedMessage:
          "لقد حصلت على شارات جديدة: {{badgeNames}}! وربحت نقاطًا إضافية: {{pointsExtra}}!",
        importantInfo:
          "قد يكون للإشعارات الهامة تاريخ انتهاء صلاحية وستختفي تلقائيًا بمجرد انتهائها.",
        noNotificationsFound: "لم يتم العثور على إشعارات.",
        noNotificationsYet: "لا توجد إشعارات بعد.",
        tapToViewDetails: "انقر لعرض التفاصيل ↗️",
        received: "تلقى:",
        receiptDetails: "تفاصيل الإيصال:",
        merchant: "التاجر:",
        total: "الإجمالي:",
        date: "التاريخ:",
        payment: "طريقة الدفع:",
        loadingReceipt: "جاري تحميل الإيصال...",
        budgetDetails: "تفاصيل الميزانية:",
        budgetName: "الاسم:",
        budgetAmount: "المبلغ:",
        budgetCategoryId: "معرف الفئة:",
        budgetStarts: "يبدأ:",
        budgetEnds: "ينتهي:",
        budgetNoLongerExists: "الميزانية لم تعد موجودة.",
        loadingBudget: "جاري تحميل الميزانية...",
        expires: "ينتهي:",
        type: "النوع:",
        budgetDeletedNotificationTitle: "تم حذف الميزانية",
        receiptUploadedNotificationTitle: "تم رفع الإيصال",
        budgetAlertNotificationTitle: "تنبيه الميزانية",
        pointsEarnedNotificationTitle: "نقاط مكتسبة",
        badgeEarnedNotificationTitle: "تم الحصول على شارة",
        receiptEditedNotificationTitle: "تم تعديل الإيصال",
        receiptEditedNotificationMessage:
          "تم تحديث الإيصال الخاص بـ {{merchantName}}.",
        financialAdviceNotificationTitle: "نصيحة مالية",
        financialAdviceDetails: "تفاصيل النصيحة:",
        loadingAdvice: "جاري تحميل النصيحة المالية...",

        premiumActivatedMessage:
          "تهانينا! اشتراكك المميز نشط الآن. استمتع بجميع الميزات الحصرية!",
        premiumDeactivatedTitle: "تم إلغاء تفعيل بريميوم",
        premiumDeactivatedMessage:
          "اشتراكك المميز لم يعد نشطًا. قد تكون بعض الميزات محدودة.",
        premiumActivatedTitle: "تم تفعيل الاشتراك المميز",
        premiumActivatedMessage:
          "اشتراكك المميز نشط الآن! استمتع بجميع المزايا.",
        premiumDeactivatedTitle: "تم إلغاء الاشتراك المميز",
        premiumDeactivatedMessage:
          "انتهى اشتراكك المميز. جدد للاستمرار في الاستمتاع بالميزات المميزة.",
      },
      settings: {
        applicationSettingsTitle: "إعدادات التطبيق",
        generalPreferences: "التفضيلات العامة",
        enableNotifications: "تمكين الإشعارات",
        comingSoon: "قريباً",
        darkMode: "الوضع الداكن",
        language: "اللغة",
        english: "الإنجليزية",
        arabic: "العربية",
        currencyPreference: "تفضيل العملة",
        currencyTitle: "العملة",
        currencyComingSoon: "تفضيل العملة قريباً!",
        yourPlanBenefits: "خطتك ومزاياها",
        currentPlan: "الخطة الحالية",
        premium: "بريميوم",
        freeTier: "المجانية",
        monthlyReceiptUploadLimit: "حد تحميل الإيصالات الشهري",
        monthlyReceiptDownloadLimit: "حد تحميل بيانات الإيصالات الشهري",
        activeBudgetLimit: "حد الميزانية النشطة",
        monthlyDataExports: "صادرات البيانات الشهرية",
        advancedSpendingAnalytics: "تحليلات الإنفاق المتقدمة",
        priorityCustomerSupport: "دعم العملاء ذو الأولوية",
        included: "مشمول",
        premiumStatus: "ميزة بريميوم",
        upgradeToPremium: "الترقية إلى بريميوم",
        allPremiumFeaturesIncluded: "جميع ميزات بريميوم مشمولة في خطتك!",
        featureManagement: "إدارة الميزات",
        walletSetup: "إعداد المحفظة",
        complete: "مكتمل",
        notSetUp: "لم يتم الإعداد",
        budgetingSetup: "إعداد الميزانية",
        dataPrivacy: "البيانات والخصوصية",
        manageMyData: "إدارة بياناتي",
        privacyControls: "ضوابط الخصوصية",
        saveSettings: "حفظ الإعدادات",
        selectLanguage: "اختر اللغة",
        notLoggedInSaveError: "يجب عليك تسجيل الدخول لحفظ الإعدادات.",
        settingsSavedSuccess: "تم حفظ الإعدادات بنجاح!",
        failedToSaveSettings: "فشل حفظ الإعدادات. الرجاء المحاولة مرة أخرى.",
        bepremium: "كن مميزا",
      },
      receipts: {
        receipts: "إجمالي الإيصالات ",
        receiptOptions: "خيارات الإيصال",
        viewReceipt: "عرض الإيصال",
        editReceipt: "تعديل الإيصال",
        downloadReceipt: "تنزيل الإيصال",
        deleteReceipt: "حذف الإيصال",
        noImageAvailable: "لا توجد صورة متاحة لهذا الإيصال.",
        failedToLoadReceiptImage: "فشل تحميل صورة الإيصال: {{error}}",
        receiptImageInfoMissing:
          "معلومات صورة الإيصال مفقودة. لا يمكن التنزيل.",
        failedToRetrieveDownloadUrl: "فشل استرداد رابط تنزيل صورة الإيصال.",
        failedToDownloadReceipt: "فشل تنزيل أو مشاركة الإيصال: {{error}}",
        confirmDeleteTitle: "تأكيد الحذف",
        confirmDeleteMessage:
          "هل أنت متأكد أنك تريد حذف هذا الإيصال؟ لا يمكن التراجع عن هذا الإجراء.",
        receiptDeletedSuccess: "تم حذف الإيصال بنجاح!",
        failedToDeleteReceipt: "فشل حذف الإيصال: {{error}}",
        loadingImage: "جاري تحميل الصورة...",
        receiptUpdatedTitle: "تم تحديث الإيصال",
        receiptUpdatedSuccess: "تم تحديث الإيصال بنجاح!",
        failedToUpdateReceipt: "فشل تحديث الإيصال: {{error}}",
        paymentMethod_cash: "نقداً",
        paymentMethod_card: "بطاقة",
        paymentMethod_bankTransfer: "تحويل بنكي",
        paymentMethod_mobilePayment: "دفع عبر الهاتف",
        paymentMethod_other: "أخرى",
      },
      points_badges: {
        yourPointsAndBadges: "نقاطك وشاراتك",
        points: "النقاط",
        badges: "الشارات",
        currentPoints: "النقاط الحالية",
        pointsMessage:
          "اكسب المزيد من النقاط عن طريق تحميل الإيصالات، وتعيين الميزانيات، وتحقيق الأهداف المالية!",
        earnedBadges: "الشارات المكتسبة",
        badgesMessage:
          "لم يتم كسب أي شارات بعد. استمر في استخدام التطبيق لفتح الإنجازات!",
      },
      tabs: {
        home: "الرئيسية",
        spending: "الإنفاق",
        upload: "تحميل",
        wallet: "المحفظة",
        budget: "الميزانية",
        account: "الحساب",
      },
      uploadModal: {
        uploadedReceiptsCount: "عدد الإيصالات المرفوعة",
        pleaseSelectToUpload: "الرجاء اختيار طريقة لتحميل إيصالاتك",
        camera: "الكاميرا",
        gallery: "الصور",
      },
      spending: {
        loadingSpendingInsights: "جاري تحميل رؤى الإنفاق...",
        spendingInsightsTitle: "رؤى الإنفاق",
        noReceiptsYet: "لم يتم تحميل أي فواتير بعد. ابدأ بتتبع نفقاتك!",
        receiptsPerMonthChartTitle: "الإيصالات شهريًا (السنة الحالية)",
        receiptsPerMonthChartDescription:
          "يوضح هذا الرسم البياني عدد الإيصالات التي قمت بتحميلها كل شهر على مدار العام الحالي. انقر على شهر في الرسم البياني أو القائمة لعرض ملخصه.",
        tapForDetails: "👇 انقر للتفاصيل",
        receiptsCount: " إيصال", // e.g., "٥ إيصالات" (the number will be converted to Arabic numeral)
        noReceiptsForCurrentYear: "لا توجد إيصالات للعام الحالي بعد.",
        spendingComparisonTitle: "مقارنة الإنفاق",
        spendingComparisonDescription:
          "قارن إنفاقك لهذا الشهر مقابل الشهر السابق.",
        increase: "زيادة",
        decrease: "انخفاض",
        noChange: "لا تغيير",
        notEnoughDataForComparison: "لا توجد بيانات كافية للمقارنة بعد.",
        averageReceiptValueTitle: "متوسط قيمة الإيصال (الشهر الحالي)",
        averageReceiptValueDescription:
          "متوسط المبلغ المنفق لكل إيصال هذا الشهر.",
        noReceiptsForAverage: "لا توجد فواتير لهذا الشهر لحساب المتوسط.",
        merchantAnalysisTitle: "تحليل التجار",
        merchantVisitsOverview: "نظرة عامة على زيارات التجار",
        merchantChartDescription: "عرض أفضل 5 تجار حسب الزيارات .",
        merchant: "التاجر",
        totalAmountShort: "الإجمالي",
        visits: "الزيارات",
        view: "عرض",
        noMerchantData: "لا توجد بيانات عن التجار متاحة.",
        itemsBreakdownTitle: "تفصيل العناصر",
        item: "العنصر",
        totalSpend: "الإجمالي",
        timesBought: "عدد مرات الشراء",
        noItemData: "لا توجد بيانات عن العناصر متاحة.",
        visitsFor: "زيارات لـ {{merchantName}}",
        purchasesFor: "مشتريات لـ {{itemName}}",
        monthlySummaryFor: "ملخص شهري لـ ",
      },
      heatmap: {
        generatingHeatmap: "جاري إنشاء خريطة الحرارة...",
        spendingHeatmapTitle: "خريطة حرارة الإنفاق (الشهر الحالي)",
        spendingHeatmapDescription:
          "توضح خريطة الحرارة هذه أنماط إنفاقك حسب يوم الأسبوع وساعة اليوم للشهر الحالي. يشير لون كل خلية إلى إجمالي الإنفاق. انقر على الخلية لترى الإيصالات التفصيلية لتلك الفترة الزمنية.",
        noHeatmapData:
          "لا توجد إيصالات للشهر الحالي بعد. قم بتحميل بعضها لرؤية أنماطك!",
        tapToViewFullScreen: "انقر للعرض بملء الشاشة",
        spendingOn: " الإنفاق في يوم",
        atTime: " الساعة ",
        totalSpent: "إجمالي الإنفاق",
        numberOfReceipts: "عدد الإيصالات",
        receipts: "الإيصالات",
        noSpendingForSlot: "لا يوجد إنفاق مسجل لهذه الفترة الزمنية.",
        detailedSpendingHeatmap: "خريطة حرارة الإنفاق التفصيلية",
      },
      wallet: {
        loadingWallet: "جاري تحميل محفظتك...",
        myWalletTitle: "محفظتي",
        walletDescription:
          "إدارة رصيدك النقدي هنا. يمكنك إضافة أو سحب الأموال، والاطلاع على سجل جميع معاملات محفظتك.",
        currentBalance: "الرصيد الحالي",
        monthlyCashFlow: "التدفق النقدي الشهري ({{month}},{{year}})",
        deposits: "الودائع",
        expensesWithdrawals: "المصروفات/السحوبات",
        netFlow: "صافي التدفق",
        averageCashExpenseTitle: "متوسط المصروفات النقدية (هذا الشهر)",
        noCashExpensesThisMonth:
          "لا توجد مصروفات نقدية لهذا الشهر لحساب المتوسط.",
        recordNewTransaction: "تسجيل معاملة جديدة",
        recentTransactions: "المعاملات الأخيرة",
        noTransactionsYet: "لا توجد معاملات بعد.",
        transactionTypeDeposit: "إيداع",
        transactionTypeWithdrawal: "سحب",
        transactionTypeManualExpense: "مصروف يدوي",
        depositDescription:
          "الأموال المستلمة في محفظتك (مثل الراتب، إيداع نقدي).",
        withdrawalDescription:
          "المبالغ النقدية التي تم سحبها من محفظتك للاستخدام العام، وليست لشراء معين (مثل سحب من ATM، تحويل نقدي).",
        manualExpenseDescription:
          "مصروف تم دفعه نقدًا أو لم يتم تسجيله عبر إيصال (مثل المشتريات الصغيرة، الإكراميات).",
        amountPlaceholder: "المبلغ ({{currencySymbol}})",
        descriptionPlaceholder: "الوصف (اختياري)",
        editTransactionTitle: "تعديل معاملة",
        recordNewTransactionTitle: "تسجيل معاملة جديدة",
        updateTransaction: "تحديث المعاملة",
        recordTransaction: "تسجيل المعاملة",
        cancel: "إلغاء",
        transactionOptions: "خيارات المعاملة",
        editTransactionButton: "تعديل المعاملة",
        deleteTransactionButton: "حذف المعاملة",
        confirmDeletionTitle: "تأكيد الحذف",
        confirmDeletionMessage:
          "هل أنت متأكد أنك تريد حذف هذه المعاملة؟ لا يمكن التراجع عن هذا الإجراء.",
        delete: "حذف",
        invalidAmount: "مبلغ غير صالح",
        pleaseEnterValidAmount: "الرجاء إدخال مبلغ إيجابي صالح.",
        missingType: "النوع مفقود",
        pleaseSelectTransactionType: "الرجاء تحديد نوع المعاملة.",
        authenticationError: "خطأ في المصادقة",
        userNotLoggedIn: "المستخدم غير مسجل الدخول.",
        saveTransactionSuccess: "تم تسجيل المعاملة بنجاح!",
        updateTransactionSuccess: "تم تحديث المعاملة بنجاح!",
        transactionUpdatedNotificationTitle: "تم تحديث معاملة المحفظة",
        transactionUpdatedNotificationMessage:
          "تم تحديث معاملة {{type}} الخاصة بك بمبلغ {{currencySymbol}}{{amount}}.",
        newTransactionNotificationTitle: "معاملة محفظة جديدة",
        newTransactionNotificationMessage:
          "تم تسجيل معاملة {{type}} جديدة بمبلغ {{currencySymbol}}{{amount}}.",
        saveTransactionFailed: "تعذر حفظ المعاملة. الرجاء المحاولة مرة أخرى.",
        transactionSaveFailedNotificationTitle: "فشلت معاملة المحفظة",
        transactionSaveFailedNotificationMessage:
          "فشل حفظ معاملة محفظتك: {{error}}.",
        deleteTransactionSuccess: "تم حذف المعاملة بنجاح!",
        transactionDeletedNotificationTitle: "تم حذف معاملة المحفظة",
        transactionDeletedNotificationMessage:
          "تم حذف معاملة {{type}} الخاصة بك بمبلغ {{currencySymbol}}{{amount}}.",
        deleteTransactionFailed: "فشل حذف المعاملة.",
        transactionDeletionFailedNotificationTitle: "فشل حذف معاملة المحفظة",
        transactionDeletionFailedNotificationMessage:
          "فشل حذف معاملة محفظتك: {{error}}.",
      },
      budget: {
        loadingBudgets: "جاري تحميل ميزانياتك...",
        myBudgetsTitle: "ميزانياتي",
        budgetDescription:
          "حدد حدود الإنفاق لفئات مختلفة لمساعدتك على البقاء ضمن المسار الصحيح. يتم حساب الميزانيات شهريًا بناءً على بيانات الإيصالات والمصروفات اليدوية.",
        setNewBudgetButton: "اضافة ميزانية جديدة",
        noBudgetsSetYet:
          "لم يتم تعيين أي ميزانيات بعد. انقر على 'تعيين ميزانية جديدة' لإنشاء أول ميزانية لك!",
        budgetFor: "ميزانية لـ {{categoryName}}",
        budgeted: "الميزانية المخصصة",
        spent: "المنفق",
        remaining: "المتبقي",
        status: "الحالة",
        underBudget: "ضمن الميزانية",
        overBudget: "تجاوز الميزانية",
        onBudget: "على الميزانية",
        noSpendingYet: "لا يوجد إنفاق بعد",
        editBudgetTitle: "تعديل الميزانية",
        setNewBudgetTitle: "تعيين ميزانية جديدة",
        selectCategory: "اختر الفئة",
        budgetAmountPlaceholder: "مبلغ الميزانية ({{currencySymbol}})",
        notesPlaceholder: "ملاحظات (اختياري)",
        saveBudgetButton: "حفظ الميزانية",
        updateBudgetButton: "تحديث الميزانية",
        cancelButton: "إلغاء",
        confirmDeletionTitle: "تأكيد حذف الميزانية",
        confirmDeletionMessage:
          "هل أنت متأكد أنك تريد حذف هذه الميزانية لـ {{categoryName}}؟ لا يمكن التراجع عن هذا الإجراء.",
        deleteButton: "حذف",
        invalidAmount: "مبلغ غير صالح",
        pleaseEnterValidAmount: "الرجاء إدخال مبلغ إيجابي صالح.",
        selectCategoryRequired: "الفئة مطلوبة",
        pleaseSelectCategory: "الرجاء تحديد فئة للميزانية.",
        budgetExistsForCategory: "الميزانية موجودة",
        budgetAlreadyExistsForCategory:
          "توجد ميزانية بالفعل لهذه الفئة. الرجاء تعديل الميزانية الحالية.",
        budgetSaveSuccess: "تم حفظ الميزانية بنجاح!",
        budgetUpdateSuccess: "تم تحديث الميزانية بنجاح!",
        budgetDeleteSuccess: "تم حذف الميزانية بنجاح!",
        budgetSaveFailed: "فشل حفظ الميزانية. الرجاء المحاولة مرة أخرى.",
        budgetDeleteFailed: "فشل حذف الميزانية. الرجاء المحاولة مرة أخرى.",
        budgetCreatedNotificationTitle: "تم تعيين ميزانية جديدة",
        budgetCreatedNotificationMessage:
          "تم تعيين ميزانية جديدة بقيمة {{currencySymbol}}{{amount}} لـ {{categoryName}}.",
        budgetUpdatedNotificationTitle: "تم تحديث الميزانية",
        budgetUpdatedNotificationMessage:
          "تم تحديث الميزانية لـ {{categoryName}} إلى {{currencySymbol}}{{amount}}.",
        budgetDeletedNotificationTitle: "تم حذف الميزانية",
        budgetDeletedNotificationMessage:
          "تم حذف الميزانية لـ {{categoryName}}.",
        budgetWarningTitle: "تنبيه الميزانية",
        budgetWarningMessageNearLimit:
          "أنت قريب من حد ميزانيتك لـ {{categoryName}}. المنفق: {{currencySymbol}}{{spentAmount}} / الميزانية المخصصة: {{currencySymbol}}{{budgetedAmount}}.",
        budgetWarningMessageOverLimit:
          "لقد تجاوزت ميزانيتك لـ {{categoryName}}! المنفق: {{currencySymbol}}{{spentAmount}} / الميزانية المخصصة: {{currencySymbol}}{{budgetedAmount}}.",
        budgetActionFailedNotificationTitle: "فشل إجراء الميزانية",
        budgetActionFailedNotificationMessage:
          "فشل تنفيذ إجراء الميزانية: {{error}}.",
        activeBudgetTrackerTitle: "متتبع الميزانية النشطة",
        activeBudgetTrackerDescription:
          "راقب ميزانياتك النشطة الحالية وادارة أهدافك المالية.",
        activeBudgetsCount: "الميزانيات النشطة:",
        remainingBudgets: "المتبقي: {{count}} ميزانية",
        limitReachedMessageSmall: "تم الوصول إلى الحد الأقصى!",
        points: "النقاط",
        badges: "الشارات",
        yourBadgesTitle: "شاراتك",
        viewAchievementsMessage: "شاهد إنجازاتك التي كسبتها!",
        viewBudgetInsightsButton: "عرض رؤى الميزانية 📊",
        monthlySpendingOverviewTitle: "نظرة عامة على الإنفاق الشهري",
        monthlySpendingOverviewDescription:
          "تتبع إنفاقك للشهر الحالي عبر الفئات، وقارنه بميزانياتك المحددة. حافظ على أهدافك المالية!",
        spent: "المنفق",
        budgeted: "الميزانية المخصصة",
        overBy: "تجاوز بمقدار {{currencySymbol}}{{amount}}",
        remainingAmount: "المتبقي: {{currencySymbol}}{{amount}}",
        yourCurrentBudgetsTitle: "ميزانياتك الحالية",
        budgetFor: "📊 ميزانية لـ {{categoryName}}",
        noBudgetsOrSpendingData: "لا توجد ميزانيات أو بيانات إنفاق بعد.",
        startYourFirstBudgetButton: "ابدأ ميزانيتك الأولى",
        noBudgetsYetCallToAction:
          "لم يتم تعيين أي ميزانيات بعد. تساعدك الميزانيات على التحكم في إنفاقك وتحقيق أهدافك المالية. ابدأ رحلتك المالية بإنشاء أول ميزانية لك!",
        createNewBudgetButton: "إنشاء ميزانية جديدة",
        updateYourBudgetTitle: "تحديث ميزانيتك",
        setUpYourBudgetTitle: "إضافة ميزانيه",
        loadingData: "جاري تحميل البيانات...",
        budgetAmountTitle: "مبلغ الميزانية",
        enterBudgetAmountPlaceholder: "أدخل مبلغ ميزانيتك",
        categoryTitle: "الفئة",
        selectCategoryPlaceholder: "اختر الفئة",
        subcategoryTitle: "الفئة الفرعية",
        selectSubcategoryPlaceholder: "اختر الفئة الفرعية",
        noSubcategoriesAvailable: "لا توجد فئات فرعية",
        startDateTitle: "تاريخ البدء",
        selectStartDatePlaceholder: "اختر تاريخ البدء",
        endDateTitle: "تاريخ الانتهاء",
        selectEndDatePlaceholder: "اختر تاريخ الانتهاء",
        calendarCancelButton: "إلغاء",
        savingButton: "جاري الحفظ...",
        saveBudgetButton: "حفظ الميزانية",
        updateBudgetButton: "تحديث الميزانية",
        cancelButton: "إلغاء",
        fillAllFieldsErrorTitle: "معلومات مفقودة",
        fillAllFieldsErrorMessage:
          "الرجاء تعبئة جميع الحقول المطلوبة (المبلغ، الفئة، تاريخ البدء، تاريخ الانتهاء).",
        invalidAmountErrorTitle: "مبلغ غير صالح",
        invalidAmountErrorMessage: "الرجاء إدخال رقم موجب صالح لميزانيتك.",
        dateOrderErrorTitle: "خطأ في التاريخ",
        dateOrderErrorMessage:
          "تاريخ البدء لا يمكن أن يكون بعد تاريخ الانتهاء.",
        budgetConflictErrorTitle: "تعارض الميزانية",
        budgetConflictErrorMessage:
          "توجد ميزانية لهذه الفئة/الفئة الفرعية بالفعل أو تتداخل مع التواريخ المختارة. الرجاء تحديث الميزانية الحالية بدلاً من ذلك، أو اختيار تواريخ/فئة مختلفة.",
        budgetUpdatedNotificationTitle: "تم تحديث الميزانية",
        budgetCreatedNotificationTitle: "تم إنشاء الميزانية",
        budgetUpdatedNotificationMessage: "تم تحديث ميزانيتك بنجاح.",
        budgetCreatedNotificationMessage: "تم إنشاء ميزانيتك بنجاح.",
        budgetedAmount: "Budgeted Amount",
        spentAmount: "Spent Amount",
        status: "Status",
        status_over: "Over Budget",
        status_under: "Under Budget",
        "status_on track": "On Track",
        updateBudgetTitle: "Update Budget",
        enterAmount: "Enter Amount",
        category: "Category",
        selectCategory: "Select a category",
        subcategory: "Subcategory",
        selectSubcategory: "Select a subcategory",
        fillAllFields: "Please fill all required fields.",
        updateSuccess: "Budget updated successfully!",
        updateError: "Failed to update budget.",
        confirmDeletionTitle: "Confirm Deletion",
        confirmDeletionMessage:
          "Are you sure you want to delete the budget for '{categoryName}'? This action cannot be undone.",
        budgetDeleteSuccess: "Budget deleted successfully!",
        budgetDeleteFailed: "Failed to delete budget: {error}",
        budgetDeletedNotificationTitle: "Budget Deleted",
        budgetDeletedNotificationMessage:
          "The budget for {categoryName} ({amount} {currencySymbol}) has been deleted.",
        budgetActionFailedNotificationTitle: "Budget Action Failed",
        budgetActionFailedNotificationMessage:
          "A budget action failed: {error}",
        budgetedAmount: "المبلغ المخصص",
        spentAmount: "المبلغ المنفق",
        status: "الحالة",
        status_over: "تجاوز الميزانية",
        status_under: "أقل من الميزانية",
        "status_on track": "على المسار الصحيح",
        updateBudgetTitle: "تعديل الميزانية",
        enterAmount: "أدخل المبلغ",
        category: "الفئة",
        selectCategory: "اختر فئة",
        subcategory: "الفئة الفرعية",
        selectSubcategory: "اختر فئة فرعية",
        fillAllFields: "يرجى ملء جميع الحقول المطلوبة.",
        updateSuccess: "تم تعديل الميزانية بنجاح!",
        updateError: "فشل تعديل الميزانية.",
        confirmDeletionTitle: "تأكيد الحذف",
        confirmDeletionMessage:
          "هل أنت متأكد أنك تريد حذف الميزانية الخاصة بـ '{categoryName}'؟ لا يمكن التراجع عن هذا الإجراء.",
        budgetDeleteSuccess: "تم حذف الميزانية بنجاح!",
        budgetDeleteFailed: "فشل حذف الميزانية: {error}",
        budgetDeletedNotificationTitle: "تم حذف الميزانية",
        budgetDeletedNotificationMessage:
          "تم حذف الميزانية الخاصة بـ {categoryName} ({amount} {currencySymbol}).",
        budgetActionFailedNotificationTitle: "فشل إجراء الميزانية",
        budgetActionFailedNotificationMessage: "فشل إجراء الميزانية: {error}",
        budgetDetailsTitle: "تفاصيل الميزانية",
        loadingDetails: "جاري تحميل التفاصيل...",
        noBudgetDataAvailable: "لا توجد بيانات ميزانية متاحة.",
        budgetAmountTitle: "مبلغ الميزانية",
        categoryTitle: "الفئة",
        subcategoryTitle: "الفئة الفرعية",
        startDateTitle: "تاريخ البدء",
        endDateTitle: "تاريخ الانتهاء",
        updateYourBudgetTitle: "تعديل ميزانيتك",
        setUpYourBudgetTitle: "إعداد ميزانيتك",
        noSubcategoriesAvailable: "لا توجد فئات فرعية متاحة لهذه الفئة.",
      },
      account: {
        accountSettingsTitle: "إعدادات الحساب",
        guestUser: "مستخدم ضيف",
        noEmailProvided: "لم يتم تقديم بريد إلكتروني",
        editProfile: "تعديل الملف الشخصي",
        applicationSettings: "إعدادات التطبيق",
        privacyPolicy: "سياسة الخصوصية",
        termsOfService: "شروط الخدمة",
        aboutUs: "حول التطبيق",
        helpCenter: "مركز المساعدة",
        logout: "تسجيل الخروج",
        logoutAlertTitle: "تأكيد تسجيل الخروج",
        logoutAlertMessage: "هل أنت متأكد أنك تريد تسجيل الخروج؟",
        cancelLogout: "إلغاء",
        confirmLogout: "تسجيل الخروج",
        logoutErrorTitle: "خطأ في تسجيل الخروج",
        loadingUserData: "جاري تحميل بيانات المستخدم...",
        deleteAccount: "حذف الحساب",
        deleteAccountConfirmTitle: "تأكيد حذف الحساب",
        deleteAccountConfirmMessage:
          "هل أنت متأكد أنك تريد طلب حذف حسابك؟ سيؤدي هذا إلى إزالة حسابك وجميع البيانات المرتبطة به بشكل دائم. سيتم توجيهك إلى تطبيق البريد الإلكتروني الخاص بك لإرسال الطلب.",
        deleteAccountConfirmButton: "نعم، احذف حسابي",
        linkOpenError:
          "تعذر فتح الرابط. يرجى التأكد من تثبيت متصفح ويب أو عميل بريد إلكتروني.",
      },
      manageData: {
        pageTitle: "إدارة بياناتي",
        dataSummaryTitle: "ملخص بياناتك",
        totalReceiptsUploaded: "إجمالي الإيصالات التي تم تحميلها",
        overallSpendingRecorded: "إجمالي الإنفاق المسجل",
        lastReceiptUploaded: "آخر إيصال تم تحميله",
        dataActionsTitle: "إجراءات البيانات",
        exportMyDataButton: "تصدير بياناتي (CSV)",
        preparingDataButton: "جاري تجهيز البيانات...",
        exportSuccessTitle: "نجاح",
        exportSuccessMessage: "تم تجهيز بياناتك للمشاركة.",
        exportSharingUnavailable: "المشاركة غير متاحة على هذا الجهاز.",
        exportErrorTitle: "خطأ",
        exportErrorMessage: "فشل تصدير البيانات. الرجاء المحاولة مرة أخرى.",
        deleteMyAccountButton: "حذف حسابي",
        deletingAccountButton: "جاري حذف الحساب...",
        deleteAccountAlertTitle: "حذف الحساب",
        deleteAccountAlertMessage:
          "هل أنت متأكد تماماً من أنك تريد حذف حسابك؟ هذا الإجراء لا رجعة فيه وستفقد جميع بياناتك.",
        cancelDelete: "إلغاء",
        confirmDelete: "حذف",
        accountDeletedTitle: "تم حذف الحساب",
        accountDeletedMessage:
          "تم حذف حسابك وجميع البيانات المرتبطة به بشكل دائم.",
        deleteAccountErrorMessage: "فشل حذف الحساب.",
        couldNotLoadSummary: "تعذر تحميل ملخص البيانات.",
        loadingDataSummary: "جاري تحميل ملخص البيانات...",
      },
      privacyPolicy: {
        pageTitle: "سياسة الخصوصية",
        effectiveDate: "تاريخ السريان: 12 يونيو 2025",
        intro:
          'مرحباً بك في O7! تصف سياسة الخصوصية هذه كيف تقوم O7 بجمع واستخدام والإفصاح عن معلوماتك عند استخدام تطبيقنا المحمول ("التطبيق").',

        section1Title: "1. المعلومات التي نجمعها",
        section1Content:
          "نحن نجمع المعلومات التي تقدمها لنا مباشرة عند استخدام التطبيق، مثل عند إنشاء حساب، أو تحميل الإيصالات، أو الاتصال بدعم العملاء. يتضمن ذلك:",
        section1List1:
          "معلومات الحساب: اسم المستخدم الخاص بك، عنوان البريد الإلكتروني، وكلمة المرور المشفرة.",
        section1List2:
          "بيانات الإيصالات: تفاصيل من إيصالاتك التي تم تحميلها، بما في ذلك اسم التاجر، التاريخ، المبلغ الإجمالي، العناصر المشتراة، الفئة، وطريقة الدفع.",
        section1List3:
          "بيانات الاتصال: المعلومات التي تقدمها عند التواصل معنا، مثل الملاحظات أو استفسارات الدعم.",

        section2Title: "2. كيف نستخدم معلوماتك",
        section2Content: "نحن نستخدم المعلومات التي نجمعها من أجل:",
        section2List1: "توفير ميزات ووظائف التطبيق وصيانتها وتحسينها.",
        section2List2: "معالجة وإدارة تحميلات إيصالاتك وبيانات الإنفاق.",
        section2List3: "تزويدك بتحليلات ورؤى مخصصة حول إنفاقك.",
        section2List4: "التواصل معك بشأن حسابك، والتحديثات، والعروض الترويجية.",
        section2List5:
          "إخفاء هوية البيانات وتجميعها لأغراض البحث والتحليل لتحسين خدماتنا.",

        section3Title: "3. مشاركة معلوماتك",
        section3Content: "قد نشارك معلوماتك على النحو التالي:",
        section3Subtitle1: "بموافقتك:",
        section3Desc1:
          "كما هو مذكور صراحة أثناء عملية تحميل الإيصال، من خلال تحميل إيصال، فإنك توافق على قيامنا بمشاركة بيانات مجهولة ومجمعة معينة مستمدة من إيصالاتك مع أطراف ثالثة لأغراض أبحاث السوق وتحليلات الأعمال. لن تحدد هذه البيانات هويتك شخصيًا.",
        section3Subtitle2: "مقدمو الخدمات:",
        section3Desc2:
          "قد نشارك المعلومات مع بائعين خارجيين، ومستشارين، ومقدمي خدمات آخرين يقومون بأداء خدمات نيابة عنا ويحتاجون إلى الوصول إلى معلوماتك لتنفيذ تلك الخدمات.",
        section3Subtitle3: "المتطلبات القانونية:",
        section3Desc3:
          "قد نكشف عن معلوماتك إذا طلب منا ذلك بموجب القانون أو بحسن نية اعتقاداً بأن هذا الإجراء ضروري للامتثال لالتزام قانوني.",

        section4Title: "4. أمان البيانات",
        section4Content:
          "نحن ننفذ إجراءات أمنية معقولة لحماية معلوماتك من الوصول غير المصرح به أو التعديل أو الكشف أو التدمير. ومع ذلك، لا يوجد نقل عبر الإنترنت أو البريد الإلكتروني آمن تمامًا أو خالٍ من الأخطاء.",

        section5Title: "5. خياراتك",
        section5Content:
          'يمكنك مراجعة وتحديث معلومات حسابك في إعدادات ملفك الشخصي. يمكنك أيضًا إدارة تفضيلات مشاركة بياناتك في قسم "ضوابط الخصوصية" في إعدادات التطبيق.',

        section6Title: "6. التغييرات على هذه السياسة",
        section6Content:
          "قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات عن طريق نشر سياسة الخصوصية الجديدة في التطبيق. يُنصح بمراجعة سياسة الخصوصية هذه بشكل دوري لأي تغييرات.",

        section7Title: "7. اتصل بنا",
        section7Content:
          "إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا على: support@o7empower.com",
      },
      termsOfService: {
        pageTitle: "شروط الخدمة",
        lastUpdated: "آخر تحديث: 12 يونيو 2025",
        intro:
          'مرحبًا بك في O7! تحكم شروط الخدمة هذه ("الشروط") استخدامك لتطبيق O7 للجوّال ("التطبيق") المقدم من O7 ("نحن" أو "لنا" أو "خاصتنا"). من خلال الوصول إلى التطبيق أو استخدامه، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق على هذه الشروط، فلا تستخدم التطبيق.',

        section1Title: "1. تسجيل الحساب",
        section1Content:
          "يجب أن يكون عمرك 18 عامًا على الأقل لإنشاء حساب واستخدام التطبيق. عند التسجيل للحصول على حساب، فإنك توافق على تقديم معلومات دقيقة وحديثة وكاملة كما هو مطلوب في نموذج التسجيل الخاص بنا. أنت مسؤول عن الحفاظ على سرية كلمة مرور حسابك وعن جميع الأنشطة التي تتم تحت حسابك.",

        section2Title: "2. استخدام التطبيق",
        section2Content1:
          "تم تصميم التطبيق لمساعدتك في تتبع نفقاتك عن طريق تحميل وإدارة إيصالاتك. أنت توافق على استخدام التطبيق لأغراض مشروعة فقط ووفقًا لهذه الشروط. يُحظر عليك:",
        section2List1: "استخدام التطبيق لأي غرض غير قانوني أو غير مصرح به.",
        section2List2: "تحميل برامج ضارة أو بيانات.",
        section2List3: "محاولة التدخل في الأداء السليم للتطبيق.",

        section3Title: "3. الملكية الفكرية",
        section3Content:
          "جميع المحتويات والميزات والوظائف الخاصة بالتطبيق (بما في ذلك على سبيل المثال لا الحصر جميع المعلومات والبرامج والنصوص والعروض والصور والفيديو والصوت، وتصميمها واختيارها وترتيبها) مملوكة لـ O7 أو المرخصين لها أو غيرهم من مقدمي هذه المواد، وهي محمية بموجب قوانين حقوق النشر والعلامات التجارية وبراءات الاختراع والأسرار التجارية وغيرها من قوانين الملكية الفكرية أو الحقوق الخاصة.",

        section4Title: "4. بيانات المستخدم والخصوصية",
        section4Content1:
          "باستخدام التطبيق وتحميل الإيصالات، فإنك توافق على جمع بياناتك واستخدامها كما هو موضح في سياسة الخصوصية الخاصة بنا.",
        section4Content2:
          "يتضمن ذلك المشاركة المجهولة والمجمعة للبيانات المستمدة من إيصالاتك مع أطراف ثالثة لأغراض أبحاث السوق وتحليلات الأعمال، ويتم ذلك بموافقتك الصريحة التي تم الحصول عليها أثناء عملية تحميل الإيصال.",

        section5Title: "5. الميزات المميزة والاشتراكات",
        section5Content:
          "قد يقدم التطبيق ميزات مميزة متاحة من خلال الاشتراك. تخضع جميع الاشتراكات لهذه الشروط وشروط متجر التطبيقات المعني (متجر تطبيقات Apple أو متجر Google Play). تتم معالجة المدفوعات من خلال آليات الشراء داخل التطبيق لمتجر التطبيقات.",

        section6Title: "6. إخلاء المسؤولية",
        section6Content:
          'يتم تقديم التطبيق "كما هو" و "كما هو متاح"، دون أي ضمانات من أي نوع، سواء صريحة أو ضمنية. نحن لا نضمن أن التطبيق سيكون غير متقطع أو خالٍ من الأخطاء أو خالٍ من الفيروسات أو المكونات الضارة الأخرى.',

        section7Title: "7. تحديد المسؤولية",
        section7Content:
          "لن تكون O7 أو الشركات التابعة لها أو المرخصون لها أو مقدمو الخدمات أو الموظفون أو الوكلاء أو المسؤولون أو المديرون مسؤولين بأي حال من الأحوال عن الأضرار من أي نوع، بموجب أي نظرية قانونية، تنشأ عن أو فيما يتعلق باستخدامك، أو عدم قدرتك على استخدام التطبيق.",

        section8Title: "8. القانون الحاكم",
        section8Content:
          "تخضع هذه الشروط وتفسر وفقًا لقوانين [الاختصاص القضائي الخاص بك]، دون اعتبار لتضارب أحكام القانون.",

        section9Title: "9. التغييرات على الشروط",
        section9Content1:
          "نحتفظ بالحق في مراجعة وتحديث هذه الشروط من وقت لآخر وفقًا لتقديرنا الخاص. تكون جميع التغييرات سارية فور نشرها.",
        section9Content2:
          "يعني استمرار استخدامك للتطبيق بعد نشر الشروط المعدلة أنك تقبل التغييرات وتوافق عليها.",

        section10Title: "10. معلومات الاتصال",
        section10Content:
          "إذا كانت لديك أي أسئلة حول هذه الشروط، يرجى الاتصال بنا على: support@o7empower.com",
      },
      financialInsights: {
        pageTitle: "تحليلات مالية",
        getAdviceButton: "احصل على نصيحة مالية",
        generatingAdvice: "جاري إنشاء النصيحة...",
        noDataTitle: "لا توجد بيانات بعد",
        noDataMessage:
          "قم بتحميل بعض الإيصالات وإعداد محفظتك/ميزانياتك للحصول على رؤى مخصصة!",
        adviceDisclaimer:
          "إخلاء مسؤولية: هذه النصيحة تم إنشاؤها بواسطة الذكاء الاصطناعي لأغراض معلوماتية فقط ولا تشكل نصيحة مالية مهنية. استشر دائمًا مستشارًا ماليًا مؤهلاً للحصول على إرشادات مخصصة.",
        adviceTitle: "نصيحتك المالية:",
        lastUpdated: "آخر تحديث:",
        adviceErrorTitle: "خطأ في النصيحة",
        adviceErrorMessage:
          "فشل الحصول على النصيحة المالية. الرجاء المحاولة مرة أخرى لاحقًا.",
        rateLimitedTitle: "عدد كبير جدا من الطلبات",
        rateLimitedMessage:
          "لقد وصلت إلى حد النصائح المجانية لهذا اليوم. قم بالترقية إلى بريميوم للحصول على رؤى غير محدودة!",
        upgradeToPremium: "الترقية إلى بريميوم",
        loadingData: "جاري تحميل بياناتك المالية...",
        topSpendingCategories: "أهم فئات الإنفاق",
        walletBalance: "رصيد المحفظة",
        freeAdviceRemaining:
          "لديك {{count}} من أصل {{max}} نصائح مجانية متبقية اليوم.",
        freeAdviceExhausted: "سيتم إعادة تعيين نصائحك المجانية غدًا.",
        unlimitedAdvice: "نصائح يومية غير محدودة!",
        upgradeToPremiumShort: "الترقية إلى بريميوم",
        frequentMerchantVisits: "زيارات المتجر المتكررة:",
        frequentItemPurchases: "مشتريات العناصر المتكررة:",
      },
      appwriteErrors: {
        networkRequestFailed:
          "فشل طلب الشبكة. الرجاء التحقق من اتصالك بالإنترنت.",
        userExists:
          "يوجد مستخدم بهذا البريد الإلكتروني بالفعل. الرجاء تسجيل الدخول أو استخدام بريد إلكتروني آخر.",
        invalidCredentials:
          "بريد إلكتروني أو كلمة مرور غير صحيحة. الرجاء المحاولة مرة أخرى.",
        userNotFound:
          "المستخدم غير موجود. الرجاء التحقق من بريدك الإلكتروني أو التسجيل.",
        sessionNotFound: "انتهت صلاحية جلستك. الرجاء تسجيل الدخول مرة أخرى.",
        accountCreationFailed: "فشل إنشاء الحساب. الرجاء المحاولة مرة أخرى.",
        signInFailed:
          "فشل تسجيل الدخول. الرجاء التحقق من بيانات الاعتماد الخاصة بك.",
        passwordResetFailed:
          "فشل إرسال بريد إعادة تعيين كلمة المرور. الرجاء المحاولة لاحقًا.",
        otpSendFailed: "فشل إرسال رمز التحقق (OTP). الرجاء المحاولة مرة أخرى.",
        invalidOtp:
          "رمز التحقق (OTP) غير صالح أو منتهي الصلاحية. الرجاء المحاولة مرة أخرى.",
        documentNotFound: "تعذر العثور على البيانات المطلوبة.",
        permissionDenied: "ليس لديك إذن لتنفيذ هذا الإجراء.",
        receiptSaveFailed: "فشل حفظ الإيصال. الرجاء المحاولة مرة أخرى.",
        receiptEditFailed: "فشل تعديل الإيصال. الرجاء المحاولة مرة أخرى.",
        receiptUploadFailed:
          "فشل تحميل صورة الإيصال. الرجاء المحاولة مرة أخرى.",
        receiptDownloadUrlFailed: "فشل الحصول على رابط تنزيل صورة الإيصال.",
        userUpdateFailed:
          "فشل تحديث بيانات ملفك الشخصي. الرجاء المحاولة مرة أخرى.",
        budgetSaveFailed: "فشل حفظ الميزانية. الرجاء المحاولة مرة أخرى.",
        budgetFetchFailed: "فشل جلب تفاصيل الميزانية.",
        notificationCreateFailed: "فشل إنشاء الإشعار.",
        notificationMarkReadFailed: "فشل وضع علامة مقروء على الإشعار.",
        appSettingsFetchFailed:
          "فشل تحميل إعدادات التطبيق. سيتم استخدام القيم الافتراضية.",
        genericAppwriteError: "حدث خطأ في Appwrite: {{message}}",
        invalidDocumentId: "معرف المستند غير صالح.",
        dataParsingError: "فشل معالجة البيانات بسبب تنسيق غير صالح.",
        receiptDeleteFailed: "فشل حذف الإيصال. الرجاء المحاولة مرة أخرى.",
        budgetInitializationFailed: "فشل التحقق من حالة الميزانية.",
        categoryFetchFailed: "فشل جلب الفئات.",
        pointsFetchFailed: "فشل جلب نقاط المستخدم.",
        badgesFetchFailed: "فشل جلب شارات المستخدم.",
        initialDataUploadFailed:
          "فشل تحميل البيانات الأولية. الرجاء الاتصال بالدعم.",
        dataParsingError: "فشل معالجة البيانات بسبب تنسيق غير صالح.",
        exportDataFailed: "فشل تصدير البيانات. الرجاء المحاولة مرة أخرى.",
        accountDeleteFailed: "فشل حذف الحساب. الرجاء المحاولة مرة أخرى.",
        exportSharingUnavailable: "المشاركة غير متاحة على هذا الجهاز.",
        walletDataLoadFailed:
          "فشل تحميل بيانات المحفظة. الرجاء المحاولة مرة أخرى.",
        walletTransactionSaveFailed:
          "فشل حفظ معاملة محفظتك. الرجاء المحاولة مرة أخرى.",
        walletTransactionUpdateFailed:
          "فشل تحديث معاملة محفظتك. الرجاء المحاولة مرة أخرى.",
        walletTransactionDeleteFailed:
          "فشل حذف معاملة محفظتك. الرجاء المحاولة مرة أخرى.",
        receiptsFetchFailed: "فشل جلب الإيصالات للفترة المحددة.",
        budgetInitializationFailed: "فشل التحقق من حالة تهيئة الميزانية.",
        categoryFetchFailed: "فشل جلب الفئات. الرجاء المحاولة مرة أخرى.",
        dataParsingError: "فشل معالجة البيانات بسبب تنسيق غير صالح.",
        exportDataFailed: "فشل تصدير البيانات. الرجاء المحاولة مرة أخرى.",
        accountDeleteFailed: "فشل حذف الحساب. الرجاء المحاولة مرة أخرى.",
        exportSharingUnavailable: "المشاركة غير متاحة على هذا الجهاز.",
        walletDataLoadFailed:
          "فشل تحميل بيانات المحفظة. الرجاء المحاولة مرة أخرى.",
        walletTransactionSaveFailed:
          "فشل حفظ معاملة محفظتك. الرجاء المحاولة مرة أخرى.",
        walletTransactionUpdateFailed:
          "فشل تحديث معاملة محفظتك. الرجاء المحاولة مرة أخرى.",
        walletTransactionDeleteFailed:
          "فشل حذف معاملة محفظتك. الرجاء المحاولة مرة أخرى.",
        receiptsFetchFailed: "فشل جلب الإيصالات للفترة المحددة.",
        budgetInitializationFailed: "فشل التحقق من حالة تهيئة الميزانية.",
        categoryFetchFailed: "فشل جلب الفئات. الرجاء المحاولة مرة أخرى.",
        userPreferencesSaveFailed:
          "فشل حفظ تفضيلات المستخدم. الرجاء المحاولة مرة أخرى.",
        sessionCheckFailed:
          "فشل التحقق من الجلسة أو جلب بيانات المستخدم. الرجاء المحاولة تسجيل الدخول مرة أخرى.",
        documentNotFound: "العنصر المطلوب لم يتم العثور عليه.",
        invalidParameters: "تم تقديم بيانات غير صالحة.",
        unauthorized: "أنت غير مصرح لك بتنفيذ هذا الإجراء.",
        forbidden: "تم رفض الوصول. ليس لديك إذن.",
        notFound: "المورد المطلوب لم يتم العثور عليه.",
        conflict:
          "حدث تعارض. قد يكون العنصر موجودًا بالفعل أو هناك عدم تطابق في البيانات.",
        tooManyRequests: "عدد كبير جداً من الطلبات. الرجاء المحاولة بعد قليل.",
        internalServerError: "حدث خطأ داخلي في الخادم. الرجاء المحاولة لاحقاً.",
        unknownError: "حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.",
        iapInitializationFailed:
          "تعذر الاتصال بالمتجر. الرجاء المحاولة لاحقاً.",
        purchaseCanceled: "لقد ألغيت عملية الشراء.",
        purchasePending: "عملية الشراء معلقة. يرجى التحقق لاحقاً.",
        purchaseFailedGeneric:
          "حدث خطأ أثناء عملية الشراء. الرجاء المحاولة مرة أخرى.",
        purchaseValidationFailed:
          "فشل التحقق من الشراء. الرجاء الاتصال بالدعم.",
        purchaseInitiationFailed:
          "تعذر بدء عملية الشراء. الرجاء المحاولة مرة أخرى.",
        userPremiumUpdateFailed:
          "فشل تحديث حالة اشتراكك المميز. الرجاء الاتصال بالدعم.",
      },
      upgradePremium: {
        planChangeSuccess: "تم تغيير خطتك بنجاح!",
        currentPlan: "الخطة الحالية",
        subscribe: "اشترك",
        processing: "جاري المعالجة...",
        getPremiumBenefitsTitle: "احصل على مزايا بريميوم",
        unlockPremiumFeatures: "افتح الميزات المميزة",
        loadingSubscriptions: "جارٍ تحميل خطط الاشتراك...",
        upgradeToPremiumTitle: "الترقية إلى بريميوم",
        fetchProductsError: "فشل في تحميل خطط الاشتراك: {{message}}",
        unlockPremiumBenefits: "افتح مزايا بريميوم:",
        unlimitedReceipts: "تحميل إيصالات غير محدود",
        customBudgets: "فئات ومتابعة ميزانية مخصصة",
        cloudSync: "مزامنة سحابية آمنة ونسخ احتياطي للبيانات",
        addFree: "تجربة خالية من الإعلانات",
        advancedSpendingAnalytics: "تحليلات إنفاق متقدمة",
        priorityCustomerSupport: "دعم عملاء ذو أولوية",
        introductoryOffer: "جرب بـ {{price}} {{currency}} لمدة {{period}}",
        chooseYourPlan: "اختر خطتك",
        noSubscriptionPlansAvailable:
          "لا تتوفر حاليًا أي خطط اشتراك. يرجى المحاولة مرة أخرى لاحقًا.",
        monthlyPlan: "الخطة الشهرية",
        yearlyPlan: "الخطة السنوية",
        unknownPlan: "خطة غير معروفة",
        restorePurchases: "استعادة المشتريات",
        termsDisclaimer:
          "بالاشتراك، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا. تتم إدارة الاشتراكات من خلال إعدادات متجر التطبيقات على جهازك.",
        purchaseSuccess: "تم تفعيل اشتراكك المميز بنجاح!",
        purchaseFailedGeneric: "فشل الشراء. يرجى المحاولة مرة أخرى.",
        purchaseNotAllowed: "لا يُسمح بالمشتريات على هذا الجهاز أو الحساب.",
        paymentPending:
          "دفعتك قيد الانتظار. سيتم تفعيل وصولك المميز بمجرد تأكيد الدفع.",
        productNotAvailable: "المنتج المحدد غير متاح للشراء.",
        purchaseInvalid: "هذا الشراء غير صالح للمنتج المحدد.",
        cannotFindProduct:
          "تعذر العثور على المنتج المحدد. يرجى المحاولة مرة أخرى لاحقًا.",
        restoreSuccess: "تمت استعادة مشترياتك السابقة بنجاح!",
        noActivePurchasesFound: "لم يتم العثور على مشتريات نشطة لحسابك.",
        restoreFailedGeneric:
          "فشل في استعادة المشتريات. يرجى المحاولة مرة أخرى.",
        networkError: "خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت.",
        updateStatusError: "فشل في تحديث حالة بريميوم: {{message}}",
        loadingDetails: "جارٍ تحميل تفاصيل بريميوم...",
        goPremiumTitle: "اذهب إلى بريميوم!",
        exportData: "تصدير البيانات إلى Excel/PDF",
        noAds: "بدون إعلانات (إن وجدت)",
        customBudgetCategories: "فئات ميزانية مخصصة",
        loadingPrice: "جارٍ تحميل السعر...",
        priceNotAvailable: "السعر غير متوفر",
        cancelAnytime: "الإلغاء في أي وقت.",
        subscribingButton: "جارٍ الاشتراك...",
        subscribeNowButton: "اشترك الآن",
        alreadyPremiumTitle: "أنت بالفعل بريميوم",
        alreadyPremiumMessage: "لديك بالفعل وصول إلى الميزات المميزة!",
        congratulationsTitle: "نجاح!",
        congratulationsMessage:
          "تهانينا! أنت الآن عضو بريميوم. استمتع بالميزات غير المحدودة!",
        financialAdviceUnlimited: "احصل على نصائح مالية بلا حدود",

        monthlySubscriptionLength: "اشتراك لمدة شهر واحد",
        yearlySubscriptionLength: "اشتراك لمدة سنة واحدة",
        serviceDescription:
          "افتح الإيصالات غير المحدودة، والميزانيات المخصصة، وتحليلات الإنفاق المتقدمة.",
        alreadySubscribed: "أنت مشترك بالفعل في الباقة المميزة.",
        subscriptionActive: "اشتراكك نشط. استمتع بجميع الميزات المميزة!",
        youArePremium: "أنت عضو مميز",
        manageSubscription: "إدارة الاشتراك",
        nextRenewal: "التجديد القادم",
        yourPlan: "خطتك",
        subscriptionExpires: "الاشتراك ينتهي في {expirationDate}.",
        resubscribe: "إعادة الاشتراك",
        "subscriptionExpires": "الاشتراك ينتهي في {expirationDate}.",
    "resubscribe": "إعادة الاشتراك",
    "cancellationInitiatedTitle": "بدء الإلغاء",
    "cancellationInitiatedMessage": "تمت إحالتك إلى المتجر لإدارة اشتراكك. يرجى ملاحظة أن تحديث حالة الإلغاء في التطبيق قد يستغرق بضع دقائق."
      },
      editProfile: {
        editProfileTitle: "تعديل الملف الشخصي",
        changeAvatar: "تغيير الصورة الرمزية",
        username: "اسم المستخدم",
        enterUsername: "أدخل اسم المستخدم الخاص بك",
        email: "البريد الإلكتروني",
        preferredCurrency: "العملة المفضلة",
        currentPassword: "كلمة المرور الحالية",
        enterCurrentPassword: "أدخل كلمة المرور الحالية",
        newPassword: "كلمة المرور الجديدة",
        enterNewPassword: "أدخل كلمة المرور الجديدة (8 أحرف على الأقل)",
        confirmNewPassword: "تأكيد كلمة المرور الجديدة",
        confirmNewPasswordPlaceholder: "تأكيد كلمة المرور الجديدة",
        saveChanges: "حفظ التغييرات",
        noChangesMade: "لم يتم إجراء أي تغييرات.",
        saveSuccess: "تم تحديث الملف الشخصي بنجاح!",
        permissionDeniedTitle: "تم رفض الإذن",
        permissionDeniedMessage:
          "تم رفض إذن الوصول إلى مكتبة الوسائط. يرجى تمكينه في الإعدادات لتغيير الصورة الرمزية.",
        imagePickerError: "فشل اختيار الصورة: {{message}}",
        passwordTooShort:
          "يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل.",
        passwordsDoNotMatch: "كلمتا المرور الجديدتان غير متطابقتين.",
        currentPasswordRequired:
          "كلمة المرور الحالية مطلوبة لتغيير كلمة المرور.",
        incorrectCurrentPassword: "كلمة المرور الحالية التي أدخلتها غير صحيحة.",
      },
      subscription: {
        loadingSubscriptions: "جاري تحميل خطط الاشتراك...",
        fetchProductsError: "فشل تحميل خطط الاشتراك: {{message}}",
        upgradeToPremiumTitle: "الترقية إلى بريميوم",
        unlockPremiumBenefits: "افتح مزايا بريميوم",
        unlimitedReceipts: "مسح وتخزين إيصالات غير محدود",
        advancedAnalytics: "تحليلات إنفاق متقدمة",
        prioritySupport: "دعم عملاء ذو أولوية",
        chooseYourPlan: "اختر خطتك",
        noSubscriptionPlansAvailable:
          "لا توجد خطط اشتراك متاحة حاليًا. يرجى المحاولة مرة أخرى لاحقًا.",
        monthlyPlan: "الخطة الشهرية",
        yearlyPlan: "الخطة السنوية",
        restorePurchases: "استعادة المشتريات",
        termsDisclaimer:
          "بالاشتراك، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا. تتجدد الاشتراكات تلقائيًا ما لم يتم إلغاؤها.",
        purchaseError: "فشل الشراء: {{message}}",
        purchaseSuccess: "الاشتراك ناجح! تم تفعيل الميزات المميزة.",
        restoreSuccess: "تمت استعادة المشتريات بنجاح!",
        restoreNoPurchases: "لم يتم العثور على مشتريات لاستعادتها.",
        restoreError: "فشل استعادة المشتريات: {{message}}",
        updateStatusError: "فشل تحديث حالة بريميوم: {{message}}",
      },
      budgetInsights: {
        // <--- Add this entire section
        title: "رؤى الميزانية",
        monthYearFormat: "yyyy MMMM", // Arabic date format often puts year first for clarity
        loadingInsights: "جاري تحميل الرؤى...",
        spendingByCategoryTitle: "الإنفاق حسب الفئة ({{month}})",
        noSpendingData: "لا توجد بيانات إنفاق لشهر {{month}}.",
        topCategoriesOverallTitle:
          "إجمالي الإنفاق لأهم الفئات (آخر {{numMonths}} أشهر)",
        noTopCategoriesData: "لا توجد بيانات إنفاق لأهم الفئات.",
        monthlyBudgetPerformanceTitle:
          "أداء الميزانية الشهري (آخر {{numMonths}} أشهر)",
        noMonthlyPerformanceData: "لا توجد بيانات أداء الميزانية الشهرية.",
        loadError: "فشل تحميل رؤى الميزانية. يرجى المحاولة مرة أخرى.",
      },

      ads: {
        sponsored: "إعلان",
        adErrorTitle: "خطأ في الإعلان",
        adErrorMessage: "تعذر تحميل الإعلان. يرجى المحاولة لاحقًا.",
        adLoadingTitle: "جاري تحميل الإعلان",
        adLoadingMessage: "الإعلان قيد التحميل، يرجى الانتظار...",
        adNotReadyTitle: "الإعلان غير جاهز",
        adNotReadyMessage: "الإعلان غير جاهز بعد. يرجى المحاولة.",
        loadingAd: "جاري تحميل الإعلان...",
        earnExtraUpload: "شاهد إعلانًا لتحصل على تحميل إيصال إضافي",
      },
      helpCenter: {
        pageTitle: "مركز المساعدة",
        intro:
          "مرحباً بك في مركز مساعدة ResynQ. هنا يمكنك العثور على إجابات للأسئلة الشائعة وموارد لمساعدتك في تحقيق أقصى استفادة من تطبيقك المالي.",
        faqTitle: "الأسئلة المتكررة",
        gettingStartedTitle: "البدء",
        faq1Q: "كيف أنشئ حسابًا؟",
        faq1A:
          "يمكنك إنشاء حساب مباشرة داخل تطبيق ResynQ باستخدام عنوان بريدك الإلكتروني وكلمة مرور آمنة. اتبع التعليمات التي تظهر على الشاشة عند التشغيل الأول.",
        faq2Q: "ما هو ResynQ Premium؟",
        faq2A:
          "يقدم ResynQ Premium تحميلات إيصالات غير محدودة، تحليلات متقدمة، فئات ميزانية مخصصة، تجربة خالية من الإعلانات، ودعم عملاء ذو أولوية. يمكنك معرفة المزيد والاشتراك من قسم المحفظة/الاشتراك في التطبيق.",
        receiptManagementTitle: "مسح الإيصالات وإدارتها",
        faq3Q: "كيف أقوم بتحميل إيصال؟",
        faq3A:
          "اضغط على زر 'تحميل' (أيقونة الكاميرا) في أسفل الشاشة. يمكنك بعد ذلك التقاط صورة لإيصالك أو اختيار واحدة من معرض جهازك. سيقوم الذكاء الاصطناعي لدينا باستخراج التفاصيل تلقائيًا.",
        faq4Q: "ماذا لو ارتكب الذكاء الاصطناعي خطأ؟",
        faq4A:
          "يمكنك بسهولة تعديل أي تفاصيل إيصال مستخرجة داخل التطبيق بعد معالجتها. ما عليك سوى النقر على المعاملة لإجراء التصحيحات.",
        faq5Q: "هل يمكنني تنزيل إيصالاتي؟",
        faq5A:
          "نعم، يمكن للمستخدمين المجانيين تنزيل ما يصل إلى 3 إيصالات، بينما يتمتع المستخدمون المميزون بتنزيلات غير محدودة. انتقل إلى قائمة إيصالاتك وحدد خيار التنزيل.",
        budgetingAnalyticsTitle: "الميزانية والتحليلات",
        faq6Q: "كيف أنشئ ميزانية؟",
        faq6A:
          "انتقل إلى علامة التبويب 'الميزانية' واضغط على أيقونة '+' لإنشاء ميزانية جديدة. يمكن للمستخدمين المجانيين إنشاء ما يصل إلى 3 ميزانيات، ويتمتع المستخدمون المميزون بميزانيات مخصصة غير محدودة.",
        faq7Q: "كيف يقوم ResynQ بتصنيف إنفاقي؟",
        faq7A:
          "يقوم الذكاء الاصطناعي لدينا بتصنيف نفقاتك تلقائيًا بناءً على التاجر وتفاصيل العنصر. يمكنك دائمًا إعادة تصنيف المعاملات يدويًا إذا لزم الأمر.",
        troubleshootingTitle: "استكشاف الأخطاء وإصلاحها",
        troubleshootingIntro: "إذا واجهت أي مشاكل أو أخطاء:",
        troubleshootingList1: "• تأكد من تحديث تطبيقك إلى أحدث إصدار.",
        troubleshootingList2: "• تحقق من اتصالك بالإنترنت.",
        troubleshootingList3: "• أعد تشغيل التطبيق.",
        troubleshootingList4:
          "• إذا استمرت المشكلة، يرجى الاتصال بفريق الدعم لدينا.",
        contactSupportTitle: "الاتصال بالدعم",
        contactSupportIntro:
          "إذا لم تتمكن من العثور على إجابة لسؤالك هنا أو كنت بحاجة إلى مزيد من المساعدة، يرجى التواصل مع فريق الدعم لدينا:",
        contactEmail: "عبر البريد الإلكتروني: support@resynq.net",
        contactWebsite:
          "عبر زيارة صفحة الدعم على موقعنا: [https://resynq.net/support.html]",
        linkOpenError:
          "تعذر فتح الرابط. يرجى التأكد من تثبيت متصفح ويب أو عميل بريد إلكتروني.",
      },
      aboutUs: {
        pageTitle: "حول التطبيق",
        intro:
          "مرحبًا بك في ResynQ، رفيقك المالي الذكي المصمم لتبسيط إدارة الإيصالات وتمكينك من تحليلات الإنفاق الثاقبة. مهمتنا هي تحويل طريقة تفاعلك مع أموالك، مما يجعل تتبع النفقات وإدارة الميزانيات واكتساب الوضوح بشأن صحتك المالية أمرًا سهلاً.\n\nنعتقد أن إدارة أموالك يجب أن تكون بسيطة، بديهية، وآمنة. لهذا السبب قمنا ببناء ResynQ بتقنية الذكاء الاصطناعي المتقدمة لأتمتة مهمة إدخال البيانات المملة، مما يتيح لك التركيز على ما يهم حقًا: فهم عادات الإنفاق الخاصة بك وتحقيق أهدافك المالية.",
        ourVisionTitle: "رؤيتنا",
        ourVisionContent:
          "تمكين الأفراد في جميع أنحاء العالم بالأدوات والرؤى اللازمة لتحقيق الحرية المالية وراحة البال، إيصالًا بإيصال.",
        ourCommitmentTitle: "التزامنا",
        ourCommitmentList1:
          "• الابتكار: التحسين المستمر لذكائنا الاصطناعي وميزاتنا لتقديم أدوات مالية أكثر كفاءة ودقة.",
        ourCommitmentList2:
          "• الأمان: حماية بياناتك المالية بإجراءات أمنية قوية ونهج يركز على الخصوصية أولاً.",
        ourCommitmentList3:
          "• تجربة المستخدم: تصميم تطبيق بديهي وممتع يجعل الإدارة المالية سهلة.",
        ourCommitmentList4:
          "• الشفافية: الوضوح بشأن كيفية جمعنا لبياناتك واستخدامها وحمايتها.",
        contactUsTitle: "اتصل بنا",
        contactUsIntro:
          "إذا كان لديك أي أسئلة أو ملاحظات، فلا تتردد في التواصل معنا:",
        contactEmail: "عبر البريد الإلكتروني: support@resynq.net",
        contactWebsite:
          "عبر زيارة صفحة الدعم على موقعنا: [https://resynq.net/support.html]",
        linkOpenError:
          "تعذر فتح الرابط. يرجى التأكد من تثبيت متصفح ويب أو عميل بريد إلكتروني.",
      },
    },
  },
};

// Function to get the initial locale from device settings
const getInitialLocale = () => {
  const locales = Localization.getLocales();
  const preferredLocaleTag = locales[0]?.languageTag;
  const finalLocale =
    typeof preferredLocaleTag === "string" ? preferredLocaleTag : "en";
  if (finalLocale.startsWith("ar")) {
    return "ar";
  }
  return "en";
};

// Initialize i18next
i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLocale(),
  fallbackLng: "en",
  debug: false,
  interpolation: {
    escapeValue: false,
    format: (value, format, lng) => {
      // Simple date formatting example (you can expand this with date-fns if needed)
      if (value instanceof Date) {
        return value.toLocaleDateString(lng); // Basic date string based on locale
      }
      return value;
    },
  },
});

// Function to set the locale and handle RTL
export const setI18nConfig = (locale) => {
  const targetLocale = typeof locale === "string" ? locale : i18n.language;
  i18n.changeLanguage(targetLocale);

  const currentI18nLanguage =
    typeof i18n.language === "string" ? i18n.language : "en";
  const isRTL = currentI18nLanguage.startsWith("ar");
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);
  }
  console.log(
    `i18n configured to locale: ${currentI18nLanguage}, RTL: ${isRTL}`
  );
};

export default i18n;
