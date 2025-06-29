// utils/i18n.js
import { I18nManager } from "react-native";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Define your translations as a resource object for i18next
const resources = {
  en: {
    translation: {
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
        dateFormatShort: "MMM dd, yyyy", // Short date format, e.g., Jan 01, 2024
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
        totalSpending: "Total Spending", // For "Total Spending: X"
        merchantBreakdownTitle: "Merchant Breakdown", // For "Merchant Breakdown" title
        merchantSpendingDescription:
          "Merchant spending figures are calculated based on the individual item prices from your receipts, prior to any discounts, VAT, or other service charges.",
        receiptOptions: "Receipt Options",
        viewDetails: "View Details",
        editReceipt: "Edit Receipt",
        downloadImage: "Download Image",
        deleteReceipt: "Delete Receipt",
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
        merchantChartDescription:
          "Displaying top 5 merchants by visits (default). Chart settings for this limit can be adjusted from the app's settings section.",
        merchant: "Merchant",
        totalAmountShort: "Total (💵)", // Placeholder for currency symbol. Actual symbol from common.currency_symbol_short will be used in code.
        visits: "Visits",
        view: "View",
        noMerchantData: "No merchant data available.",
        itemsBreakdownTitle: "Items Breakdown",
        item: "Item",
        totalSpend: "Total Spend",
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
        totalSpending: "إجمالي الإنفاق",
        merchantBreakdownTitle: "توزيع التجار",
        merchantSpendingDescription:
          "يتم احتساب أرقام إنفاق التجار بناءً على أسعار العناصر الفردية في إيصالاتك، قبل تطبيق أي خصومات أو ضريبة القيمة المضافة أو رسوم خدمة أخرى.",
        receiptOptions: "خيارات الفاتورة",
        viewDetails: "عرض التفاصيل",
        editReceipt: "تعديل الايصال",
        downloadImage: "تحميل الايصال",
        deleteReceipt: "حذف الايصال",
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
        merchantChartDescription:
          "عرض أفضل 5 تجار حسب الزيارات (افتراضي). يمكن تعديل إعدادات الرسم البياني لهذا الحد من قسم إعدادات التطبيق.",
        merchant: "التاجر",
        totalAmountShort: "الإجمالي (💵)",
        visits: "الزيارات",
        view: "عرض",
        noMerchantData: "لا توجد بيانات عن التجار متاحة.",
        itemsBreakdownTitle: "تفصيل العناصر",
        item: "العنصر",
        totalSpend: "إجمالي الإنفاق",
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
        spendingOn: "الإنفاق في ",
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
