# MoneyManager API Documentation

This document provides comprehensive API documentation for the MoneyManager application. Use this reference when building the React Native mobile version.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [Transactions](#transactions-endpoints)
  - [Categories](#categories-endpoints)
  - [Ledgers](#ledgers-endpoints)
  - [Ledger Sharing](#ledger-sharing-endpoints)
  - [User Preferences](#user-preferences-endpoints)
  - [Activity Logs](#activity-logs-endpoints)
  - [Receipts](#receipts-endpoints)
- [Error Handling](#error-handling)

---

## Overview

| Property | Value |
|----------|-------|
| **Base URL** | Production: `https://your-domain.vercel.app` |
| **API Prefix** | `/api` |
| **Authentication** | JWT-based via NextAuth |
| **Content-Type** | `application/json` |
| **Database** | PostgreSQL via Prisma ORM |

---

## Authentication

The API uses **NextAuth.js** with a JWT-based session strategy. After signing in, include the session cookie in all subsequent requests.

### Authentication Flow for React Native

For React Native, you'll need to:

1. Call `/api/auth/signin` with credentials
2. Store the returned session token securely (e.g., `expo-secure-store`)
3. Include the token in the `Authorization` header or as a cookie for subsequent requests

### Session Object

```typescript
interface Session {
  user: {
    id: string;      // User's unique CUID
    username: string; // User's username
  };
  expires: string;   // ISO date string
}
```

---

## Data Models

### User

```typescript
interface User {
  id: string;              // CUID, primary key
  username: string;        // Unique username (min 3 chars)
  password: string;        // Hashed with bcrypt (12 rounds)
  currentLedgerId?: string; // Currently active ledger ID
  darkMode: boolean;       // Theme preference (default: false)
  createdAt: Date;
  updatedAt: Date;
}
```

### Ledger

```typescript
interface Ledger {
  id: string;          // CUID, primary key
  name: string;        // Ledger name (default: "My Ledger")
  ownerId: string;     // User ID of owner
  currency: string;    // Currency code (default: "USD")
  createdAt: Date;
  updatedAt: Date;
}
```

### Category

```typescript
interface Category {
  id: string;        // CUID, primary key
  name: string;      // Category name
  type: string;      // "Income" | "Expense"
  icon: string;      // Emoji icon
  color: string;     // Hex color code (default: "#3498db")
  ledgerId: string;  // Associated ledger ID
}
```

### Transaction

```typescript
interface Transaction {
  id: string;           // CUID, primary key
  description: string;  // Transaction description
  amount: number;       // Float amount
  type: string;         // "Income" | "Expense"
  categoryId: string;   // Associated category ID
  ledgerId: string;     // Associated ledger ID
  date: Date;           // Transaction date
  note?: string;        // Optional note
  receiptImage?: string; // Base64 encoded compressed image
  createdAt: Date;
  updatedAt: Date;
}
```

### LedgerUser (Sharing)

```typescript
interface LedgerUser {
  id: string;        // CUID, primary key
  ledgerId: string;  // Ledger being shared
  userId: string;    // User receiving access
  role: string;      // "viewer" | "editor"
  createdAt: Date;
}
```

### ActivityLog

```typescript
interface ActivityLog {
  id: string;         // CUID, primary key
  ledgerId: string;   // Associated ledger
  userId: string;     // User who performed action
  action: string;     // "CREATE" | "UPDATE" | "DELETE" | "CLEAR"
  message: string;    // Human-readable message
  entityType: string; // "TRANSACTION" | "CATEGORY" | "LEDGER"
  entityId?: string;  // ID of affected entity
  createdAt: Date;
}
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/signup

Create a new user account with a default ledger and categories.

**Request Body:**

```json
{
  "username": "string",  // min 3 characters
  "password": "string"   // min 6 characters
}
```

**Success Response (200):**

```json
{
  "message": "User created successfully",
  "userId": "cuid_string"
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | `Username and password are required` |
| 400 | `Username must be at least 3 characters` |
| 400 | `Password must be at least 6 characters` |
| 409 | `Username already exists` |
| 500 | `An error occurred during signup` |

**Default Categories Created:**

| Name | Type | Icon | Color |
|------|------|------|-------|
| Salary | Income | 💼 | #27ae60 |
| Freelance | Income | 💻 | #3498db |
| Investment | Income | 📈 | #9b59b6 |
| Gift | Income | 🎁 | #e67e22 |
| Other Income | Income | 💰 | #1abc9c |
| Food & Dining | Expense | 🍔 | #e74c3c |
| Transportation | Expense | 🚗 | #f39c12 |
| Shopping | Expense | 🛒 | #9b59b6 |
| Entertainment | Expense | 🎬 | #3498db |
| Bills & Utilities | Expense | 📱 | #e67e22 |
| Healthcare | Expense | 🏥 | #1abc9c |
| Education | Expense | 📚 | #34495e |
| Other Expense | Expense | 💸 | #95a5a6 |

---

#### POST /api/auth/[...nextauth]

NextAuth.js authentication endpoint. Handles sign-in, sign-out, session management.

**Sign In Request:**

```typescript
// Using NextAuth signIn function
import { signIn } from 'next-auth/react';

await signIn('credentials', {
  username: 'string',
  password: 'string',
  redirect: false
});
```

**For React Native:**

```typescript
// Direct API call for React Native
const response = await fetch('/api/auth/callback/credentials', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'string',
    password: 'string',
    csrfToken: 'obtained_from_csrf_endpoint'
  })
});
```

---

### Transactions Endpoints

#### GET /api/transactions

Get all transactions for the authenticated user across all owned and shared ledgers.

**Headers:**

```
Cookie: next-auth.session-token=<token>
```

**Success Response (200):**

```json
[
  {
    "id": "cuid_string",
    "description": "Grocery shopping",
    "amount": 75.50,
    "type": "Expense",
    "date": "2024-01-15",
    "note": "Weekly groceries",
    "category": "Food & Dining",
    "categoryId": "cuid_string",
    "ledgerId": "cuid_string",
    "receiptImage": "data:image/webp;base64,...",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 401 | `Unauthorized` |
| 500 | `Failed to fetch transactions` |

---

#### POST /api/transactions

Create a new transaction.

**Request Body:**

```json
{
  "description": "string",      // Required
  "amount": 100.00,             // Required, number
  "type": "Income|Expense",     // Required
  "date": "2024-01-15",         // Required, ISO date string
  "categoryId": "cuid_string",  // Required
  "ledgerId": "cuid_string",    // Optional, uses first ledger if not provided
  "note": "string",             // Optional
  "receiptImage": "base64..."   // Optional, base64 encoded image
}
```

**Success Response (200):**

```json
{
  "id": "cuid_string",
  "description": "string",
  "amount": 100.00,
  "type": "Income",
  "date": "2024-01-15",
  "note": "string",
  "category": "Salary",
  "categoryId": "cuid_string",
  "ledgerId": "cuid_string",
  "receiptImage": "base64...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | `Missing required fields` |
| 401 | `Unauthorized` |
| 404 | `Ledger not found or access denied` |
| 404 | `Category not found or access denied` |
| 500 | `Failed to create transaction` |

> **Note:** For shared ledgers, user must have `editor` role to create transactions.

---

#### PUT /api/transactions/[id]

Update an existing transaction.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Transaction CUID |

**Request Body:**

```json
{
  "description": "string",      // Required
  "amount": 100.00,             // Required
  "type": "Income|Expense",     // Required
  "date": "2024-01-15",         // Required
  "categoryId": "cuid_string",  // Required
  "note": "string",             // Optional
  "receiptImage": "base64..."   // Optional
}
```

**Success Response (200):**

```json
{
  "id": "cuid_string",
  "description": "string",
  "amount": 100.00,
  "type": "Income",
  "date": "2024-01-15",
  "note": "string",
  "category": "Salary",
  "categoryId": "cuid_string",
  "ledgerId": "cuid_string",
  "receiptImage": "base64..."
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | `Missing required fields` |
| 401 | `Unauthorized` |
| 404 | `Transaction not found or access denied` |
| 404 | `Category not found or access denied` |
| 500 | `Failed to update transaction` |

---

#### DELETE /api/transactions/[id]

Delete a transaction.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Transaction CUID |

**Success Response (200):**

```json
{
  "success": true
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 401 | `Unauthorized` |
| 404 | `Transaction not found or access denied` |
| 500 | `Failed to delete transaction` |

---

### Categories Endpoints

#### GET /api/categories

Get all categories for the authenticated user across all owned and shared ledgers.

**Success Response (200):**

```json
[
  {
    "id": "cuid_string",
    "name": "Food & Dining",
    "type": "Expense",
    "color": "#e74c3c",
    "icon": "🍔",
    "ledgerId": "cuid_string"
  }
]
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 401 | `Unauthorized` |
| 500 | `Failed to fetch categories` |

---

#### POST /api/categories

Create a new category.

**Request Body:**

```json
{
  "name": "string",          // Required
  "type": "Income|Expense",  // Required
  "color": "#hexcode",       // Required
  "icon": "🎯",              // Required (emoji)
  "ledgerId": "cuid_string"  // Required
}
```

**Success Response (200):**

```json
{
  "id": "cuid_string",
  "name": "string",
  "type": "Income",
  "color": "#hexcode",
  "icon": "🎯",
  "ledgerId": "cuid_string"
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | `Missing required fields` |
| 401 | `Unauthorized` |
| 404 | `Ledger not found or access denied` |
| 500 | `Failed to create category` |

---

#### PUT /api/categories/[id]

Update an existing category.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Category CUID |

**Request Body:**

```json
{
  "name": "string",          // Required
  "type": "Income|Expense",  // Required
  "color": "#hexcode",       // Required
  "icon": "🎯"               // Required
}
```

**Success Response (200):**

```json
{
  "id": "cuid_string",
  "name": "string",
  "type": "Income",
  "color": "#hexcode",
  "icon": "🎯",
  "ledgerId": "cuid_string"
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | `Missing required fields` |
| 401 | `Unauthorized` |
| 404 | `Category not found or access denied` |
| 500 | `Failed to update category` |

---

#### DELETE /api/categories/[id]

Delete a category. Cannot delete if category is used by transactions.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Category CUID |

**Success Response (200):**

```json
{
  "success": true
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | `Cannot delete category. It is being used by X transaction(s).` |
| 401 | `Unauthorized` |
| 404 | `Category not found or access denied` |
| 500 | `Failed to delete category` |

---

### Ledgers Endpoints

#### GET /api/ledgers

Get all ledgers (owned and shared) for the authenticated user.

**Success Response (200):**

```json
[
  {
    "id": "cuid_string",
    "name": "My Ledger",
    "currency": "USD",
    "ownerId": "cuid_string",
    "isOwner": true,
    "categories": [
      {
        "id": "cuid_string",
        "name": "Salary",
        "type": "Income",
        "color": "#27ae60",
        "icon": "💼",
        "ledgerId": "cuid_string"
      }
    ],
    "sharedWith": [
      {
        "userId": "cuid_string",
        "username": "john_doe",
        "role": "editor"
      }
    ]
  },
  {
    "id": "cuid_string",
    "name": "Shared Ledger",
    "currency": "EUR",
    "ownerId": "cuid_string",
    "isOwner": false,
    "role": "viewer",
    "categories": [...],
    "owner": {
      "id": "cuid_string",
      "username": "owner_username"
    }
  }
]
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 401 | `Unauthorized` |
| 500 | `Failed to fetch ledgers` |

---

#### POST /api/ledgers

Create a new ledger with default categories.

**Request Body:**

```json
{
  "name": "string",     // Required
  "currency": "USD"     // Optional, defaults to "USD"
}
```

**Success Response (200):**

```json
{
  "id": "cuid_string",
  "name": "string",
  "currency": "USD",
  "ownerId": "cuid_string",
  "isOwner": true,
  "categories": [...]
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | `Missing required fields` |
| 401 | `Unauthorized` |
| 500 | `Failed to create ledger` |

---

#### PATCH /api/ledger/[id]

Rename a ledger. Only the owner can rename.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Ledger CUID |

**Request Body:**

```json
{
  "name": "string"  // Required
}
```

**Success Response (200):**

```json
{
  "id": "cuid_string",
  "name": "New Name",
  "ownerId": "cuid_string",
  "currency": "USD",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | `Name is required` |
| 401 | `Unauthorized` |
| 403 | `Forbidden: Only the owner can rename the ledger` |
| 404 | `Ledger not found` |
| 500 | `Failed to update ledger` |

---

#### PATCH /api/ledger/[id]/currency

Update the currency of a ledger. Only the owner can update.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Ledger CUID |

**Request Body:**

```json
{
  "currency": "EUR"  // Required, currency code
}
```

**Success Response (200):**

```json
{
  "message": "Currency updated successfully",
  "ledger": {
    "id": "cuid_string",
    "currency": "EUR"
  }
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | `Currency is required` |
| 401 | `Unauthorized` |
| 404 | `Ledger not found or you do not have permission to edit it` |
| 500 | `An error occurred while updating currency` |

---

#### GET /api/user/ledger

Get the user's first ledger, creating a default one if none exists.

**Success Response (200):**

```json
{
  "id": "cuid_string",
  "name": "My Ledger",
  "currency": "USD",
  "categories": [
    {
      "id": "cuid_string",
      "name": "Food",
      "type": "Expense",
      "color": "#FF6B6B",
      "icon": "restaurant",
      "ledgerId": "cuid_string"
    }
  ]
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 401 | `Unauthorized` |
| 500 | `Failed to fetch user ledger` |

---

### Ledger Sharing Endpoints

#### POST /api/ledger/invite

Invite a user to share your ledger.

**Request Body:**

```json
{
  "username": "string",        // Required, username to invite
  "role": "editor|viewer"      // Optional, defaults to "editor"
}
```

**Success Response (200):**

```json
{
  "message": "User invited successfully",
  "ledgerUser": {
    "id": "cuid_string",
    "username": "invited_user",
    "role": "editor",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | `Username is required` |
| 400 | `Cannot invite yourself` |
| 401 | `Unauthorized` |
| 404 | `User not found` |
| 404 | `Ledger not found` |
| 409 | `User already has access to this ledger` |
| 500 | `An error occurred while inviting user` |

---

#### GET /api/ledger/invite

Get list of users with access to your ledger.

**Success Response (200):**

```json
{
  "sharedUsers": [
    {
      "id": "cuid_string",
      "username": "shared_user",
      "role": "editor",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 401 | `Unauthorized` |
| 404 | `Ledger not found` |
| 500 | `An error occurred while fetching shared users` |

---

#### PATCH /api/ledger/invite/[id]

Update a shared user's role. Only the ledger owner can update roles.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | LedgerUser CUID |

**Request Body:**

```json
{
  "role": "editor|viewer"  // Required
}
```

**Success Response (200):**

```json
{
  "message": "Role updated successfully",
  "ledgerUser": {
    "id": "cuid_string",
    "username": "shared_user",
    "role": "viewer",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | `Invalid role. Must be "editor" or "viewer"` |
| 401 | `Unauthorized` |
| 403 | `Only the ledger owner can update access` |
| 404 | `Shared access not found` |
| 500 | `An error occurred while updating role` |

---

#### DELETE /api/ledger/invite/[id]

Remove a user's access to your ledger. Only the ledger owner can remove access.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | LedgerUser CUID |

**Success Response (200):**

```json
{
  "message": "Access removed successfully"
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 401 | `Unauthorized` |
| 403 | `Only the ledger owner can remove access` |
| 404 | `Shared access not found` |
| 500 | `An error occurred while removing access` |

---

### User Preferences Endpoints

#### GET /api/user/preferences

Get the current user's preferences.

**Success Response (200):**

```json
{
  "currentLedgerId": "cuid_string",
  "darkMode": false
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 401 | `Unauthorized` |
| 404 | `User not found` |
| 500 | `An error occurred while fetching preferences` |

---

#### PATCH /api/user/preferences

Update user preferences.

**Request Body:**

```json
{
  "currentLedgerId": "cuid_string",  // Optional
  "darkMode": true                    // Optional
}
```

**Success Response (200):**

```json
{
  "currentLedgerId": "cuid_string",
  "darkMode": true
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 401 | `Unauthorized` |
| 500 | `An error occurred while updating preferences` |

---

### Activity Logs Endpoints

#### GET /api/logs

Get activity logs for all user's ledgers (owned and shared). Limited to 100 most recent entries.

**Success Response (200):**

```json
[
  {
    "id": "cuid_string",
    "ledgerId": "cuid_string",
    "userId": "cuid_string",
    "action": "CREATE",
    "message": "john_doe added a new transaction to My Ledger",
    "entityType": "TRANSACTION",
    "entityId": "cuid_string",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

**Action Types:**

| Action | Description |
|--------|-------------|
| CREATE | Entity was created |
| UPDATE | Entity was modified |
| DELETE | Entity was deleted |
| CLEAR | Bulk operation (e.g., clearing receipts) |

**Entity Types:**

| Type | Description |
|------|-------------|
| TRANSACTION | Transaction record |
| CATEGORY | Category record |
| LEDGER | Ledger record |

**Error Responses:**

| Status | Error |
|--------|-------|
| 401 | `Unauthorized` |
| 500 | `Failed to fetch logs` |

---

### Receipts Endpoints

#### GET /api/receipts/stats

Get receipt storage statistics for the current ledger.

**Success Response (200):**

```json
{
  "totalReceipts": 15,
  "totalSize": 2457600,
  "formattedSize": "2.34 MB"
}
```

**Response when no ledger selected:**

```json
{
  "totalReceipts": 0,
  "totalSize": 0,
  "formattedSize": "0 Bytes"
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 401 | `Unauthorized` |
| 500 | `Failed to fetch receipt statistics` |

---

#### DELETE /api/receipts/stats

Clear all receipt images for the current ledger. Only ledger owners can perform this action.

**Success Response (200):**

```json
{
  "message": "Receipt images cleared successfully",
  "clearedCount": 15
}
```

**Response when no ledger selected:**

```json
{
  "message": "No ledger selected",
  "clearedCount": 0
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 401 | `Unauthorized` |
| 403 | `Only ledger owners can clear receipt images` |
| 500 | `Failed to clear receipt images` |

---

## Error Handling

### Common Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Missing or invalid parameters |
| 401 | Unauthorized - Not authenticated |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist or access denied |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## React Native Integration Tips

### 1. Authentication Setup

```typescript
// Use a library like react-native-auth or custom token management
import * as SecureStore from 'expo-secure-store';

async function login(username: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  // Store session tokens securely
  await SecureStore.setItemAsync('session', JSON.stringify(sessionData));
}
```

### 2. API Client Setup

```typescript
const apiClient = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const session = await SecureStore.getItemAsync('session');
    
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(session && { Authorization: `Bearer ${JSON.parse(session).token}` }),
        ...options.headers,
      },
    });
  }
};
```

### 3. Receipt Image Handling

```typescript
// Use expo-image-picker and compress before upload
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

async function pickAndCompressReceipt() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
    base64: true,
  });
  
  if (!result.canceled) {
    // Compress further if needed
    const manipulated = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 800 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.WEBP, base64: true }
    );
    
    return `data:image/webp;base64,${manipulated.base64}`;
  }
}
```

### 4. Offline Support Consideration

Consider implementing:
- Local SQLite or AsyncStorage for offline transactions
- Sync queue for pending operations
- Conflict resolution for shared ledgers

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-17 | Initial API documentation |
