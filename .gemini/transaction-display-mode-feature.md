# Transaction Display Mode Feature

## Overview
Added a user preference setting to toggle between **Cards View** and **Table View** for the transactions page. The preference is stored in localStorage and defaults to **Cards View**.

## Changes Made

### 1. Settings Page (`src/app/settings/page.tsx`)
- Added a new setting section: "Transaction Display Mode"
- Includes a toggle switch to switch between Cards and Table views
- Visual feedback with labels showing current mode
- Persists the choice to localStorage as `transaction_display_mode`
- Shows a success notification when the mode is changed

**Location**: Added after the Currency setting in the settings list

### 2. Transactions Page (`src/app/transactions/page.tsx`)
- Added state management to read the display mode preference from localStorage
- Defaults to 'cards' if no preference is saved
- Listens for changes to the preference (supports multi-tab updates)
- Conditionally renders either:
  - **TransactionList** component (for cards view)
  - **TransactionTable** component (for table view)
- The "Table Settings" (column picker) button is only shown when in table mode

## User Experience

### How to Use
1. Navigate to **Settings** page
2. Find the "Transaction Display Mode" setting
3. Use the toggle switch to choose between:
   - **Cards** (left position) - Default
   - **Table** (right position)
4. Navigate to the **Transactions** page to see the change
5. The preference is saved automatically and persists across sessions

### Features
- **Default View**: Cards view (more visual, shows transaction details in card format)
- **Alternative View**: Table view (compact, spreadsheet-like layout with customizable columns)
- **Persistent**: Preference is saved in browser localStorage
- **Real-time Updates**: Changes in settings are reflected immediately on the transactions page
- **Context-Aware UI**: Table-specific controls (column picker) only appear in table mode

## Technical Details

### localStorage Key
- Key: `transaction_display_mode`
- Values: `'cards'` | `'table'`
- Default: `'cards'`

### Components Used
- **TransactionList**: Displays transactions as individual cards with visual appeal
- **TransactionTable**: Displays transactions in a table format with sortable/customizable columns

### Benefits
- No database changes required
- Client-side only preference
- Fast switching between views
- Backward compatible (defaults to cards if no preference exists)
