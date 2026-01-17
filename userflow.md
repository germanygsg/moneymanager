# User Flow and Experience Documentation

This document provides comprehensive documentation of the MoneyManager application's user flows, user experience patterns, and interaction design.

## Table of Contents

- [Overview](#overview)
- [User Personas](#user-personas)
- [Authentication Flows](#authentication-flows)
- [Core User Journeys](#core-user-journeys)
- [Feature Flows](#feature-flows)
- [UI/UX Patterns](#uiux-patterns)
- [Mobile Experience](#mobile-experience)
- [Error Handling](#error-handling)
- [Accessibility](#accessibility)

---

## Overview

### Application Type
- **Platform**: Progressive Web Application (PWA)
- **Primary Device**: Mobile-first, responsive design
- **Framework**: Next.js with Material-UI
- **Navigation**: Bottom navigation + sidebar drawer

### Design Philosophy
1. **Mobile-First**: Optimized for touch interactions
2. **Progressive Disclosure**: Show information as needed
3. **Immediate Feedback**: Real-time updates and confirmations
4. **Collaborative**: Multi-user support with clear role indicators
5. **Accessible**: WCAG 2.1 AA compliant

---

## User Personas

### Persona 1: Solo User - "Sarah the Freelancer"
- **Goal**: Track personal income and expenses
- **Needs**: Quick transaction entry, visual reports, receipt storage
- **Behavior**: Logs transactions daily, reviews weekly
- **Pain Points**: Forgetting to log transactions, losing receipts

### Persona 2: Collaborative User - "Mike & Lisa (Couple)"
- **Goal**: Manage shared household finances
- **Needs**: Real-time sync, activity logs, role-based access
- **Behavior**: Both add transactions, review together monthly
- **Pain Points**: Duplicate entries, unclear who added what

### Persona 3: Team Manager - "Alex the Small Business Owner"
- **Goal**: Track business expenses with team
- **Needs**: Multiple ledgers, viewer/editor roles, audit trail
- **Behavior**: Reviews reports weekly, delegates data entry
- **Pain Points**: Need to control who can modify data

---

## Authentication Flows

### 1. First-Time User Registration

```
┌─────────────────────────────────────────────────────────┐
│                    Landing Page                         │
│                  (Auto-redirect)                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Sign Up Page                           │
│  ┌───────────────────────────────────────────────┐     │
│  │ Logo & Welcome Message                        │     │
│  │ "Create your account"                         │     │
│  │                                               │     │
│  │ [Username Input] (min 3 chars)                │     │
│  │ [Password Input] (min 6 chars, show/hide)     │     │
│  │                                               │     │
│  │ [Sign Up Button]                              │     │
│  │                                               │     │
│  │ "Already have an account? Sign In"            │     │
│  └───────────────────────────────────────────────┘     │
└────────────────────┬────────────────────────────────────┘
                     │ (Submit)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Account Creation Process                   │
│  1. Validate username (unique, min 3 chars)             │
│  2. Hash password (bcrypt, 12 rounds)                   │
│  3. Create user record                                  │
│  4. Create default ledger "My Ledger"                   │
│  5. Create 13 default categories                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Success Notification                       │
│  "Account created successfully!"                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Auto Sign-In & Redirect                    │
│              → Dashboard (Home Page)                    │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- Real-time validation feedback
- Password strength indicator
- Show/hide password toggle
- Gradient background for visual appeal
- Automatic ledger and category setup

**Error States:**
- Username already exists → Show error, suggest alternatives
- Password too short → Show inline validation
- Network error → Show retry option

---

### 2. Returning User Sign In

```
┌─────────────────────────────────────────────────────────┐
│                  Sign In Page                           │
│  ┌───────────────────────────────────────────────┐     │
│  │ Logo & Welcome Message                        │     │
│  │ "Welcome Back"                                │     │
│  │                                               │     │
│  │ [Username Input]                              │     │
│  │ [Password Input] (show/hide toggle)           │     │
│  │                                               │     │
│  │ [Sign In Button]                              │     │
│  │                                               │     │
│  │ "Don't have an account? Sign Up"              │     │
│  └───────────────────────────────────────────────┘     │
└────────────────────┬────────────────────────────────────┘
                     │ (Submit)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Authentication Process                     │
│  1. Validate credentials                                │
│  2. Create JWT session                                  │
│  3. Load user preferences                               │
│  4. Load current ledger                                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Success Notification                       │
│  "Sign in successful! Redirecting..."                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Dashboard (Home Page)                      │
│  - Shows current ledger data                            │
│  - Loads transactions, categories                       │
│  - Displays summary cards                               │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- Remember username (browser autocomplete)
- Secure password handling
- Session persistence
- Smooth transition to dashboard

**Error States:**
- Invalid credentials → "Invalid username or password"
- Account locked → Contact support message
- Network error → Retry option

---

## Core User Journeys

### Journey 1: Adding a Transaction (Primary Flow)

```
┌─────────────────────────────────────────────────────────┐
│                    Dashboard                            │
│  [+ FAB Button] (Floating Action Button)                │
└────────────────────┬────────────────────────────────────┘
                     │ (Tap)
                     ▼
┌─────────────────────────────────────────────────────────┐
│            Transaction Form Dialog                      │
│  ┌───────────────────────────────────────────────┐     │
│  │ Add Transaction                               │     │
│  │                                               │     │
│  │ Type: [Income] [Expense] (Toggle buttons)     │     │
│  │                                               │     │
│  │ Amount: [______] (Numeric keypad)             │     │
│  │                                               │     │
│  │ Category: [Dropdown] (Filtered by type)       │     │
│  │                                               │     │
│  │ Description: [______]                         │     │
│  │                                               │     │
│  │ Date: [Date Picker] (Default: today)          │     │
│  │                                               │     │
│  │ Note: [______] (Optional)                     │     │
│  │                                               │     │
│  │ Receipt: [📷 Add Photo] (Optional)            │     │
│  │                                               │     │
│  │ [Cancel] [Save]                               │     │
│  └───────────────────────────────────────────────┘     │
└────────────────────┬────────────────────────────────────┘
                     │ (Save)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Validation & Processing                    │
│  1. Validate required fields                            │
│  2. Compress receipt image (if added)                   │
│  3. Send to API                                         │
│  4. Log activity (if shared ledger)                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Success Feedback                           │
│  - Snackbar: "Transaction added successfully"           │
│  - Dialog closes                                        │
│  - Dashboard updates immediately                        │
│  - Summary cards recalculate                            │
│  - Charts update                                        │
│  - Transaction appears in list                          │
└─────────────────────────────────────────────────────────┘
```

**Interaction Details:**
- **Type Toggle**: Visual feedback on selection (color change)
- **Amount Input**: Auto-focus, numeric keyboard on mobile
- **Category Dropdown**: Shows only relevant categories (Income/Expense)
- **Receipt Camera**: Opens native camera or file picker
- **Save Button**: Disabled until required fields filled

**Smart Features:**
- Auto-save draft (localStorage)
- Recent categories appear first
- Currency symbol from ledger settings
- Receipt compression (WebP, max 800px width)

---

### Journey 2: Viewing Financial Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Dashboard                            │
│  ┌───────────────────────────────────────────────┐     │
│  │ Overview Cards (4 cards in grid)              │     │
│  │ ┌──────────┐ ┌──────────┐                     │     │
│  │ │ Income   │ │ Expense  │                     │     │
│  │ │ $5,000   │ │ $3,200   │                     │     │
│  │ └──────────┘ └──────────┘                     │     │
│  │ ┌──────────┐ ┌──────────┐                     │     │
│  │ │ Balance  │ │ Trans.   │                     │     │
│  │ │ $1,800   │ │ 45       │                     │     │
│  │ └──────────┘ └──────────┘                     │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ Charts Section                                │     │
│  │ ┌─────────────────────────────────────┐       │     │
│  │ │ Income vs Expense (Pie Chart)       │       │     │
│  │ │ - Visual comparison                 │       │     │
│  │ │ - Percentage breakdown              │       │     │
│  │ └─────────────────────────────────────┘       │     │
│  │                                               │     │
│  │ ┌─────────────────────────────────────┐       │     │
│  │ │ Expenses by Category (Bar Chart)    │       │     │
│  │ │ - Top 5 categories                  │       │     │
│  │ │ - Color-coded bars                  │       │     │
│  │ └─────────────────────────────────────┘       │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ Recent Transactions (Latest 10)               │     │
│  │ ┌─────────────────────────────────────┐       │     │
│  │ │ 🍔 Food & Dining    -$25.00  Today  │       │     │
│  │ │ 💼 Salary          +$5000   Jan 15  │       │     │
│  │ │ 🚗 Transportation   -$45.00  Jan 14 │       │     │
│  │ └─────────────────────────────────────┘       │     │
│  │ [View All Transactions →]                     │     │
│  └───────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

**Visual Hierarchy:**
1. **Summary Cards** (Top) - Quick glance at key metrics
2. **Charts** (Middle) - Visual insights
3. **Recent Transactions** (Bottom) - Latest activity

**Interactive Elements:**
- Cards: Tap to see detailed breakdown
- Charts: Tap segments for category details
- Transactions: Swipe to edit/delete (mobile)

---

### Journey 3: Managing Shared Ledger

```
┌─────────────────────────────────────────────────────────┐
│                  Settings Page                          │
│  [Invite User to Collaborate]                           │
└────────────────────┬────────────────────────────────────┘
                     │ (Tap)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Invite User Dialog                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ Invite User                                   │     │
│  │                                               │     │
│  │ Username: [______]                            │     │
│  │                                               │     │
│  │ Role:                                         │     │
│  │ ○ Editor (Can add/edit transactions)          │     │
│  │ ○ Viewer (Read-only access)                   │     │
│  │                                               │     │
│  │ [Cancel] [Send Invite]                        │     │
│  └───────────────────────────────────────────────┘     │
└────────────────────┬────────────────────────────────────┘
                     │ (Send)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Validation & Processing                    │
│  1. Check if username exists                            │
│  2. Check if already shared                             │
│  3. Create LedgerUser record                            │
│  4. User gets immediate access                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Success Feedback                           │
│  "User invited successfully"                            │
│                                                         │
│  Shared Users List Updates:                             │
│  ┌───────────────────────────────────────────────┐     │
│  │ john_doe        [Editor ▼]      [×]           │     │
│  │ jane_smith      [Viewer ▼]      [×]           │     │
│  └───────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

**Invited User Experience:**

```
┌─────────────────────────────────────────────────────────┐
│          Invited User Signs In                          │
│  - Sees new ledger in ledger switcher                   │
│  - Ledger shows "Shared with you" badge                 │
│  - Role indicator visible (Editor/Viewer)               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│          Access Based on Role                           │
│                                                         │
│  Editor:                                                │
│  ✓ View all transactions                                │
│  ✓ Add new transactions                                 │
│  ✓ Edit transactions                                    │
│  ✓ Delete transactions                                  │
│  ✓ Add/edit categories                                  │
│  ✗ Change currency                                      │
│  ✗ Invite users                                         │
│  ✗ Rename ledger                                        │
│                                                         │
│  Viewer:                                                │
│  ✓ View all transactions                                │
│  ✓ View reports                                         │
│  ✗ Add/edit/delete anything                            │
│  ✗ Change settings                                      │
└─────────────────────────────────────────────────────────┘
```

**Activity Logging:**
- All actions logged with username
- Visible in Activity Logs page
- Shows who did what and when

---

## Feature Flows

### 1. Transaction Management

#### Editing a Transaction

```
Transaction List → Tap Transaction → Edit Icon
                                    ↓
                        Transaction Form (Pre-filled)
                                    ↓
                        Make Changes → Save
                                    ↓
                        Update Confirmation
                                    ↓
                        List Updates + Activity Log
```

#### Deleting a Transaction

```
Transaction List → Tap Transaction → Delete Icon
                                    ↓
                        Confirmation Dialog
                        "Are you sure? Cannot be undone"
                                    ↓
                        [Cancel] [Delete]
                                    ↓
                        Delete Confirmation
                                    ↓
                        List Updates + Activity Log
```

#### Filtering Transactions

```
Transactions Page → Filter Icon
                        ↓
            ┌───────────────────────┐
            │ Filter Options        │
            │                       │
            │ Date Range:           │
            │ [From] [To]           │
            │                       │
            │ Type:                 │
            │ ○ All                 │
            │ ○ Income              │
            │ ○ Expense             │
            │                       │
            │ Category:             │
            │ [Dropdown]            │
            │                       │
            │ Search:               │
            │ [Text input]          │
            │                       │
            │ [Clear] [Apply]       │
            └───────────────────────┘
                        ↓
            Results Update in Real-time
```

---

### 2. Category Management

#### Adding a Category

```
Categories Page → [+ Add Category]
                        ↓
            ┌───────────────────────┐
            │ New Category          │
            │                       │
            │ Name: [______]        │
            │                       │
            │ Type:                 │
            │ ○ Income              │
            │ ○ Expense             │
            │                       │
            │ Icon: [Emoji Picker]  │
            │                       │
            │ Color: [Color Picker] │
            │                       │
            │ [Cancel] [Save]       │
            └───────────────────────┘
                        ↓
            Category Added → Available in Dropdowns
```

#### Deleting a Category

```
Categories Page → Category → Delete Icon
                        ↓
            Check if Used by Transactions
                        ↓
        ┌───────────────┴───────────────┐
        │                               │
    Used by N                      Not Used
    Transactions                        │
        │                               │
    Error Message:                  Confirmation
    "Cannot delete.                     │
    Used by N trans."              [Delete]
                                        │
                                Category Deleted
```

---

### 3. Ledger Switching

```
Settings → Current Ledger Section
                ↓
    ┌───────────────────────────┐
    │ Current: Family Budget    │
    │ (Owner)                   │
    ├───────────────────────────┤
    │ Switch to:                │
    │                           │
    │ ┌─────────────────────┐   │
    │ │ Personal Budget     │   │
    │ │ (Owner)             │   │
    │ └─────────────────────┘   │
    │                           │
    │ ┌─────────────────────┐   │
    │ │ Work Expenses       │   │
    │ │ (Shared - Editor)   │   │
    │ └─────────────────────┘   │
    └───────────────────────────┘
                ↓
        Tap Ledger to Switch
                ↓
    ┌───────────────────────────┐
    │ Loading...                │
    │ - Fetch ledger data       │
    │ - Load transactions       │
    │ - Load categories         │
    │ - Update currency         │
    └───────────────────────────┘
                ↓
        Dashboard Updates
        - New ledger name in header
        - New transactions
        - New summary
        - New charts
```

---

### 4. Receipt Management

#### Adding a Receipt

```
Transaction Form → [📷 Add Receipt]
                        ↓
            ┌───────────────────────┐
            │ Choose Source         │
            │ ○ Take Photo          │
            │ ○ Choose from Gallery │
            └───────────────────────┘
                        ↓
            Native Camera/Gallery Opens
                        ↓
            Image Selected
                        ↓
            ┌───────────────────────┐
            │ Processing...         │
            │ - Resize to 800px     │
            │ - Compress to WebP    │
            │ - Convert to base64   │
            └───────────────────────┘
                        ↓
            Preview in Form
                        ↓
            Save Transaction with Receipt
```

#### Viewing a Receipt

```
Transaction List → Transaction with 📷 Icon
                        ↓
            Tap to View Details
                        ↓
            ┌───────────────────────┐
            │ Transaction Details   │
            │                       │
            │ [Receipt Image]       │
            │ (Tap to enlarge)      │
            │                       │
            │ Amount: $50.00        │
            │ Category: Food        │
            │ Date: Jan 15          │
            │ Note: Grocery store   │
            └───────────────────────┘
                        ↓
            Tap Image → Full Screen View
                        ↓
            Pinch to Zoom
```

#### Clearing All Receipts

```
Settings → Receipt Storage Section
                ↓
    Shows: 15 receipts, 2.34 MB
                ↓
    [Clear All Receipts] (Owner only)
                ↓
    ┌───────────────────────────┐
    │ Confirmation Dialog       │
    │                           │
    │ "Clear all receipt images │
    │ from this ledger?"        │
    │                           │
    │ This will remove images   │
    │ from 15 transactions.     │
    │                           │
    │ [Cancel] [Clear]          │
    └───────────────────────────┘
                ↓
    Processing → Success
                ↓
    "Cleared 15 receipt images"
```

---

### 5. Reports and Analytics

```
Reports Page
    ↓
┌───────────────────────────────────┐
│ Time Period Selector              │
│ [This Month ▼]                    │
│ - This Week                       │
│ - This Month                      │
│ - Last Month                      │
│ - This Year                       │
│ - Custom Range                    │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│ Summary Cards                     │
│ ┌──────────┐ ┌──────────┐        │
│ │ Income   │ │ Expense  │        │
│ └──────────┘ └──────────┘        │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│ Category Breakdown                │
│                                   │
│ Income:                           │
│ ▓▓▓▓▓▓▓▓▓▓ Salary      $5000      │
│ ▓▓ Freelance           $500       │
│                                   │
│ Expenses:                         │
│ ▓▓▓▓▓▓ Food & Dining   $800       │
│ ▓▓▓▓ Transportation    $450       │
│ ▓▓▓ Shopping           $350       │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│ Trend Chart                       │
│ (Line chart showing daily/weekly) │
│ - Income trend                    │
│ - Expense trend                   │
└───────────────────────────────────┘
    ↓
[Export Report] → Download CSV/PDF
```

---

## UI/UX Patterns

### Navigation Structure

```
┌─────────────────────────────────────┐
│         App Bar (Top)               │
│  [☰] MoneyManager    [Ledger ▼]    │
└─────────────────────────────────────┘
│                                     │
│         Main Content                │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                [+] FAB              │
└─────────────────────────────────────┘
│  Bottom Navigation (Mobile)         │
│  [🏠 Home] [💰 Trans] [📊 Reports]  │
│  [📁 Categories] [⚙️ Settings]      │
└─────────────────────────────────────┘
```

**Desktop:**
- Persistent sidebar navigation
- Wider content area
- Hover states for interactive elements

**Mobile:**
- Bottom navigation bar
- Collapsible sidebar (hamburger menu)
- Touch-optimized tap targets (min 48px)

---

### Color System

#### Semantic Colors

| Purpose | Color | Usage |
|---------|-------|-------|
| Income | Green (#27ae60) | Income transactions, positive balance |
| Expense | Red (#e74c3c) | Expense transactions, negative values |
| Primary | Purple (#667eea) | Buttons, links, active states |
| Success | Green (#4caf50) | Success messages, confirmations |
| Error | Red (#f44336) | Error messages, destructive actions |
| Warning | Orange (#ff9800) | Warnings, cautions |
| Info | Blue (#2196f3) | Informational messages |

#### Dark Mode

- Automatic theme switching based on user preference
- Stored in user profile
- Applies to all pages and components
- Smooth transition animation

---

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Page Title | Roboto | 32px | Bold |
| Section Header | Roboto | 24px | Bold |
| Card Title | Roboto | 18px | Medium |
| Body Text | Roboto | 16px | Regular |
| Caption | Roboto | 14px | Regular |
| Button | Roboto | 16px | Medium |

---

### Spacing System

- Base unit: 8px
- Spacing scale: 8, 16, 24, 32, 40, 48px
- Consistent padding and margins
- Responsive breakpoints:
  - Mobile: < 600px
  - Tablet: 600-960px
  - Desktop: > 960px

---

### Interactive States

#### Buttons

| State | Visual |
|-------|--------|
| Default | Solid color, normal shadow |
| Hover | Slightly darker, elevated shadow |
| Active | Pressed appearance, reduced shadow |
| Disabled | Greyed out, no shadow, no cursor |
| Loading | Spinner, disabled state |

#### Form Fields

| State | Visual |
|-------|--------|
| Default | Light border, placeholder text |
| Focus | Highlighted border, label moves up |
| Filled | Darker text, label stays up |
| Error | Red border, error message below |
| Disabled | Greyed out, no interaction |

---

### Feedback Mechanisms

#### Snackbar Notifications

```
┌─────────────────────────────────────┐
│ ✓ Transaction added successfully   │
└─────────────────────────────────────┘
```

- Appears at top center
- Auto-dismisses after 6 seconds
- Can be manually dismissed
- Color-coded by type (success/error/info)

#### Loading States

- **Full Page**: Centered spinner
- **Component**: Skeleton screens
- **Button**: Inline spinner + disabled state
- **List**: Progressive loading with placeholders

#### Confirmation Dialogs

```
┌─────────────────────────────────────┐
│ Delete Transaction?                 │
│                                     │
│ Are you sure you want to delete     │
│ this transaction? This action       │
│ cannot be undone.                   │
│                                     │
│         [Cancel]  [Delete]          │
└─────────────────────────────────────┘
```

- Used for destructive actions
- Clear title and message
- Cancel button (default)
- Destructive button (red, secondary)

---

## Mobile Experience

### Touch Interactions

#### Swipe Gestures

```
Transaction List:
  Swipe Left  → Delete action
  Swipe Right → Edit action
```

#### Pull to Refresh

```
Dashboard/Transaction List:
  Pull Down → Refresh data
  Release   → Loading indicator
  Complete  → Updated content
```

#### Long Press

```
Transaction Item:
  Long Press → Quick actions menu
               - Edit
               - Delete
               - Duplicate
               - View Receipt
```

---

### Responsive Layouts

#### Dashboard - Mobile (< 600px)

```
┌─────────────────────────┐
│ Summary Cards (1 col)   │
│ ┌─────────────────────┐ │
│ │ Income              │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Expense             │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Balance             │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Transactions        │ │
│ └─────────────────────┘ │
│                         │
│ Charts (Full width)     │
│                         │
│ Recent Transactions     │
└─────────────────────────┘
```

#### Dashboard - Tablet (600-960px)

```
┌───────────────────────────────────┐
│ Summary Cards (2 cols)            │
│ ┌──────────┐ ┌──────────┐        │
│ │ Income   │ │ Expense  │        │
│ └──────────┘ └──────────┘        │
│ ┌──────────┐ ┌──────────┐        │
│ │ Balance  │ │ Trans.   │        │
│ └──────────┘ └──────────┘        │
│                                   │
│ Charts (Full width)               │
│                                   │
│ Recent Transactions               │
└───────────────────────────────────┘
```

#### Dashboard - Desktop (> 960px)

```
┌─────────────────────────────────────────────┐
│ Summary Cards (4 cols)                      │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                │
│ │Inc │ │Exp │ │Bal │ │Trn │                │
│ └────┘ └────┘ └────┘ └────┘                │
│                                             │
│ ┌──────────────┐ ┌──────────────────────┐  │
│ │ Charts       │ │ Recent Transactions  │  │
│ │              │ │                      │  │
│ │              │ │                      │  │
│ └──────────────┘ └──────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

### Offline Support (Future Enhancement)

```
┌─────────────────────────────────────┐
│ Offline Mode Indicator              │
│ "You're offline. Changes will sync  │
│  when you're back online."          │
└─────────────────────────────────────┘
    ↓
Add Transaction Offline
    ↓
Stored in Local Queue
    ↓
Connection Restored
    ↓
Auto-sync to Server
    ↓
Confirmation: "Synced 3 transactions"
```

---

## Error Handling

### Error Types and User Experience

#### Network Errors

```
┌─────────────────────────────────────┐
│ ⚠️ Connection Error                 │
│                                     │
│ Unable to connect to the server.    │
│ Please check your internet          │
│ connection and try again.           │
│                                     │
│         [Retry]  [Dismiss]          │
└─────────────────────────────────────┘
```

#### Validation Errors

```
Form Field:
┌─────────────────────────────────────┐
│ Amount: [______]                    │
│ ⚠️ Amount must be greater than 0    │
└─────────────────────────────────────┘
```

#### Permission Errors

```
┌─────────────────────────────────────┐
│ ⚠️ Access Denied                    │
│                                     │
│ You don't have permission to        │
│ perform this action. Only the       │
│ ledger owner can change currency.   │
│                                     │
│              [OK]                   │
└─────────────────────────────────────┘
```

#### Server Errors

```
┌─────────────────────────────────────┐
│ ⚠️ Something Went Wrong             │
│                                     │
│ An unexpected error occurred.       │
│ Please try again later.             │
│                                     │
│ Error ID: ERR_500_ABC123            │
│                                     │
│         [Retry]  [Report]           │
└─────────────────────────────────────┘
```

---

## Accessibility

### WCAG 2.1 AA Compliance

#### Keyboard Navigation

- All interactive elements accessible via Tab
- Enter/Space to activate buttons
- Escape to close dialogs
- Arrow keys for navigation in lists

#### Screen Reader Support

- Semantic HTML elements
- ARIA labels for icons
- ARIA live regions for dynamic content
- Descriptive alt text for images

#### Color Contrast

- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- Color not sole indicator of meaning

#### Focus Indicators

- Visible focus outline on all interactive elements
- High contrast focus indicators
- Skip to main content link

---

## Performance Optimizations

### Loading Strategies

1. **Critical Path**: Load essential data first
2. **Progressive Enhancement**: Show skeleton screens
3. **Lazy Loading**: Load images and charts on demand
4. **Code Splitting**: Route-based code splitting

### Caching Strategy

- **API Responses**: Cache with SWR (stale-while-revalidate)
- **Images**: Browser cache + service worker
- **Static Assets**: Long-term caching with versioning

---

## Analytics and Tracking (Future Enhancement)

### User Events to Track

| Event | Description |
|-------|-------------|
| Sign Up | New user registration |
| Sign In | User authentication |
| Add Transaction | Transaction creation |
| Edit Transaction | Transaction modification |
| Delete Transaction | Transaction deletion |
| Invite User | Ledger sharing |
| Switch Ledger | Ledger context change |
| Export Data | Data export action |
| Add Receipt | Receipt image upload |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial user flow documentation |

---

## Future Enhancements

### Planned Features

1. **Recurring Transactions**: Auto-create monthly bills
2. **Budget Planning**: Set category budgets with alerts
3. **Multi-Currency**: Support multiple currencies per ledger
4. **Export Formats**: PDF, CSV, Excel export options
5. **Notifications**: Email/push notifications for shared ledger activity
6. **Tags**: Add custom tags to transactions
7. **Search**: Advanced search with filters
8. **Bulk Operations**: Select multiple transactions for bulk actions

---

This documentation should be updated as new features are added or user flows change.
