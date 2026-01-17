# Database Schema Documentation

This document provides comprehensive documentation of the MoneyManager application's database schema, including all tables, relationships, indexes, and constraints.

## Table of Contents

- [Overview](#overview)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Tables](#tables)
  - [User](#user-table)
  - [Ledger](#ledger-table)
  - [LedgerUser](#ledgeruser-table)
  - [Category](#category-table)
  - [Transaction](#transaction-table)
  - [ActivityLog](#activitylog-table)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Data Constraints](#data-constraints)
- [Default Data](#default-data)

---

## Overview

| Property | Value |
|----------|-------|
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Schema Version** | 1.0.0 |
| **ID Strategy** | CUID (Collision-resistant Unique Identifier) |
| **Timestamp Strategy** | Automatic `createdAt` and `updatedAt` |

### Key Features

- **Multi-tenancy**: Each user can own multiple ledgers
- **Collaboration**: Ledgers can be shared with multiple users
- **Soft Relationships**: Categories cannot be deleted if used by transactions
- **Cascading Deletes**: Deleting a ledger removes all associated data
- **Activity Tracking**: All major operations are logged

---

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       │ owns (1:N)
       │
       ├──────────────────────┐
       │                      │
       ▼                      ▼
┌─────────────┐        ┌─────────────┐
│   Ledger    │◄───────┤ LedgerUser  │ (Junction Table)
└──────┬──────┘ shares └──────┬──────┘
       │                      │
       │ has (1:N)            │ belongs to (N:1)
       │                      │
       ├──────────┬───────────┴──────────┐
       │          │                      │
       ▼          ▼                      ▼
┌─────────────┐ ┌─────────────┐  ┌─────────────┐
│  Category   │ │ Transaction │  │ ActivityLog │
└─────────────┘ └─────────────┘  └─────────────┘
       │              │
       └──────────────┘
        belongs to (N:1)
```

---

## Tables

### User Table

Stores user authentication and preference information.

**Table Name:** `User`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | Unique user identifier |
| `username` | String | UNIQUE, NOT NULL | User's login username |
| `password` | String | NOT NULL | Bcrypt hashed password (12 rounds) |
| `currentLedgerId` | String | NULLABLE | ID of currently active ledger |
| `darkMode` | Boolean | DEFAULT false | User's theme preference |
| `createdAt` | DateTime | DEFAULT now() | Account creation timestamp |
| `updatedAt` | DateTime | AUTO UPDATE | Last update timestamp |

**Relationships:**
- `ownedLedgers` → Ledger[] (One-to-Many)
- `sharedLedgers` → LedgerUser[] (One-to-Many)
- `activityLogs` → ActivityLog[] (One-to-Many)

**Validation Rules:**
- Username: Minimum 3 characters
- Password: Minimum 6 characters (enforced at API level)

**Example:**
```sql
{
  id: "clh1a2b3c4d5e6f7g8h9i0j1",
  username: "john_doe",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzQzqX5u4W",
  currentLedgerId: "clh2b3c4d5e6f7g8h9i0j1k2",
  darkMode: false,
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z"
}
```

---

### Ledger Table

Stores ledger information. Each ledger is a separate financial workspace.

**Table Name:** `Ledger`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | Unique ledger identifier |
| `name` | String | DEFAULT "My Ledger" | Ledger display name |
| `ownerId` | String | NOT NULL, FOREIGN KEY | Reference to User.id |
| `currency` | String | DEFAULT "USD" | Currency code (USD, EUR, IDR, etc.) |
| `createdAt` | DateTime | DEFAULT now() | Ledger creation timestamp |
| `updatedAt` | DateTime | AUTO UPDATE | Last update timestamp |

**Relationships:**
- `owner` → User (Many-to-One)
- `sharedWith` → LedgerUser[] (One-to-Many)
- `categories` → Category[] (One-to-Many)
- `transactions` → Transaction[] (One-to-Many)
- `activityLogs` → ActivityLog[] (One-to-Many)

**Cascade Behavior:**
- ON DELETE CASCADE: Deleting a ledger removes all categories, transactions, activity logs, and sharing records

**Indexes:**
- `ownerId` (for efficient owner lookup)

**Example:**
```sql
{
  id: "clh2b3c4d5e6f7g8h9i0j1k2",
  name: "Family Budget",
  ownerId: "clh1a2b3c4d5e6f7g8h9i0j1",
  currency: "USD",
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z"
}
```

---

### LedgerUser Table

Junction table for ledger sharing. Manages many-to-many relationship between users and ledgers.

**Table Name:** `LedgerUser`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | Unique sharing record identifier |
| `ledgerId` | String | NOT NULL, FOREIGN KEY | Reference to Ledger.id |
| `userId` | String | NOT NULL, FOREIGN KEY | Reference to User.id |
| `role` | String | DEFAULT "viewer" | Access level: "viewer" or "editor" |
| `createdAt` | DateTime | DEFAULT now() | Sharing creation timestamp |

**Relationships:**
- `ledger` → Ledger (Many-to-One)
- `user` → User (Many-to-One)

**Constraints:**
- UNIQUE (`ledgerId`, `userId`) - Prevents duplicate sharing records

**Cascade Behavior:**
- ON DELETE CASCADE: Deleting a ledger or user removes sharing records

**Indexes:**
- `ledgerId` (for efficient ledger lookup)
- `userId` (for efficient user lookup)
- Composite unique index on (`ledgerId`, `userId`)

**Role Types:**
- `viewer`: Can view transactions and reports, cannot modify
- `editor`: Can create, update, and delete transactions and categories

**Example:**
```sql
{
  id: "clh3c4d5e6f7g8h9i0j1k2l3",
  ledgerId: "clh2b3c4d5e6f7g8h9i0j1k2",
  userId: "clh4d5e6f7g8h9i0j1k2l3m4",
  role: "editor",
  createdAt: "2024-01-15T10:30:00.000Z"
}
```

---

### Category Table

Stores income and expense categories for transactions.

**Table Name:** `Category`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | Unique category identifier |
| `name` | String | NOT NULL | Category display name |
| `type` | String | NOT NULL | "Income" or "Expense" |
| `icon` | String | NOT NULL | Emoji icon for visual representation |
| `color` | String | DEFAULT "#3498db" | Hex color code for UI |
| `ledgerId` | String | NOT NULL, FOREIGN KEY | Reference to Ledger.id |

**Relationships:**
- `ledger` → Ledger (Many-to-One)
- `transactions` → Transaction[] (One-to-Many)

**Cascade Behavior:**
- ON DELETE CASCADE: Deleting a ledger removes all categories
- ON DELETE RESTRICT: Cannot delete category if used by transactions

**Indexes:**
- `ledgerId` (for efficient ledger lookup)
- `type` (for filtering by income/expense)

**Type Values:**
- `Income`: For money received
- `Expense`: For money spent

**Example:**
```sql
{
  id: "clh5e6f7g8h9i0j1k2l3m4n5",
  name: "Salary",
  type: "Income",
  icon: "💼",
  color: "#27ae60",
  ledgerId: "clh2b3c4d5e6f7g8h9i0j1k2"
}
```

---

### Transaction Table

Stores all financial transactions (income and expenses).

**Table Name:** `Transaction`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | Unique transaction identifier |
| `description` | String | NOT NULL | Transaction description |
| `amount` | Float | NOT NULL | Transaction amount (positive number) |
| `type` | String | NOT NULL | "Income" or "Expense" |
| `categoryId` | String | NOT NULL, FOREIGN KEY | Reference to Category.id |
| `ledgerId` | String | NOT NULL, FOREIGN KEY | Reference to Ledger.id |
| `date` | DateTime | DEFAULT now() | Transaction date |
| `note` | String | NULLABLE | Optional additional notes |
| `receiptImage` | Text | NULLABLE | Base64 encoded compressed receipt image |
| `createdAt` | DateTime | DEFAULT now() | Record creation timestamp |
| `updatedAt` | DateTime | AUTO UPDATE | Last update timestamp |

**Relationships:**
- `category` → Category (Many-to-One)
- `ledger` → Ledger (Many-to-One)

**Cascade Behavior:**
- ON DELETE CASCADE: Deleting a ledger removes all transactions
- ON DELETE RESTRICT: Cannot delete category if used by transactions

**Indexes:**
- `ledgerId` (for efficient ledger lookup)
- `categoryId` (for efficient category lookup)
- `date` (for date-based queries and sorting)
- `type` (for filtering by income/expense)

**Receipt Image Format:**
- Stored as base64-encoded WebP image
- Compressed to reduce storage size
- Format: `data:image/webp;base64,<base64_data>`

**Example:**
```sql
{
  id: "clh6f7g8h9i0j1k2l3m4n5o6",
  description: "Monthly salary",
  amount: 5000.00,
  type: "Income",
  categoryId: "clh5e6f7g8h9i0j1k2l3m4n5",
  ledgerId: "clh2b3c4d5e6f7g8h9i0j1k2",
  date: "2024-01-15T00:00:00.000Z",
  note: "January 2024 salary",
  receiptImage: null,
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z"
}
```

---

### ActivityLog Table

Stores audit trail of all major operations in shared ledgers.

**Table Name:** `ActivityLog`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | Unique log entry identifier |
| `ledgerId` | String | NOT NULL, FOREIGN KEY | Reference to Ledger.id |
| `userId` | String | NOT NULL, FOREIGN KEY | Reference to User.id |
| `action` | String | NOT NULL | Action type (CREATE, UPDATE, DELETE, CLEAR) |
| `message` | String | NOT NULL | Human-readable log message |
| `entityType` | String | NOT NULL | Entity type (TRANSACTION, CATEGORY, LEDGER) |
| `entityId` | String | NULLABLE | ID of affected entity |
| `createdAt` | DateTime | DEFAULT now() | Log entry timestamp |

**Relationships:**
- `ledger` → Ledger (Many-to-One)
- `user` → User (Many-to-One)

**Cascade Behavior:**
- ON DELETE CASCADE: Deleting a ledger or user removes activity logs

**Indexes:**
- `ledgerId` (for efficient ledger lookup)
- `userId` (for efficient user lookup)

**Action Types:**
- `CREATE`: Entity was created
- `UPDATE`: Entity was modified
- `DELETE`: Entity was deleted
- `CLEAR`: Bulk operation (e.g., clearing receipts)

**Entity Types:**
- `TRANSACTION`: Transaction record
- `CATEGORY`: Category record
- `LEDGER`: Ledger record

**Example:**
```sql
{
  id: "clh7g8h9i0j1k2l3m4n5o6p7",
  ledgerId: "clh2b3c4d5e6f7g8h9i0j1k2",
  userId: "clh1a2b3c4d5e6f7g8h9i0j1",
  action: "CREATE",
  message: "john_doe added a new transaction to Family Budget",
  entityType: "TRANSACTION",
  entityId: "clh6f7g8h9i0j1k2l3m4n5o6",
  createdAt: "2024-01-15T10:30:00.000Z"
}
```

---

## Relationships

### One-to-Many Relationships

| Parent Table | Child Table | Relationship | Cascade |
|--------------|-------------|--------------|---------|
| User | Ledger | User owns multiple ledgers | CASCADE |
| User | LedgerUser | User can be shared on multiple ledgers | CASCADE |
| User | ActivityLog | User performs multiple actions | CASCADE |
| Ledger | Category | Ledger has multiple categories | CASCADE |
| Ledger | Transaction | Ledger has multiple transactions | CASCADE |
| Ledger | LedgerUser | Ledger can be shared with multiple users | CASCADE |
| Ledger | ActivityLog | Ledger has multiple activity logs | CASCADE |
| Category | Transaction | Category is used by multiple transactions | RESTRICT |

### Many-to-Many Relationships

| Table 1 | Junction Table | Table 2 | Description |
|---------|----------------|---------|-------------|
| User | LedgerUser | Ledger | Users can access multiple ledgers, ledgers can be shared with multiple users |

---

## Indexes

### Primary Indexes

All tables use CUID as primary key with automatic indexing.

### Foreign Key Indexes

| Table | Column | Purpose |
|-------|--------|---------|
| Ledger | `ownerId` | Fast lookup of user's owned ledgers |
| LedgerUser | `ledgerId` | Fast lookup of ledger's shared users |
| LedgerUser | `userId` | Fast lookup of user's shared ledgers |
| Category | `ledgerId` | Fast lookup of ledger's categories |
| Category | `type` | Fast filtering by income/expense |
| Transaction | `ledgerId` | Fast lookup of ledger's transactions |
| Transaction | `categoryId` | Fast lookup of category's transactions |
| Transaction | `date` | Fast date-based queries and sorting |
| Transaction | `type` | Fast filtering by income/expense |
| ActivityLog | `ledgerId` | Fast lookup of ledger's activity logs |
| ActivityLog | `userId` | Fast lookup of user's activity logs |

### Composite Unique Indexes

| Table | Columns | Purpose |
|-------|---------|---------|
| LedgerUser | `ledgerId`, `userId` | Prevent duplicate sharing records |

---

## Data Constraints

### Field Constraints

| Table | Field | Constraint | Description |
|-------|-------|------------|-------------|
| User | username | UNIQUE | No duplicate usernames |
| User | username | MIN LENGTH 3 | Enforced at API level |
| User | password | MIN LENGTH 6 | Enforced at API level |
| Category | - | RESTRICT DELETE | Cannot delete if used by transactions |
| LedgerUser | ledgerId, userId | UNIQUE PAIR | One sharing record per user per ledger |

### Business Logic Constraints

1. **Category Deletion**: Categories cannot be deleted if they are referenced by any transactions
2. **Ledger Ownership**: Only ledger owners can:
   - Rename the ledger
   - Change currency
   - Invite/remove users
   - Clear receipt images
3. **Ledger Access**: Shared users have role-based permissions:
   - Viewers: Read-only access
   - Editors: Can create/update/delete transactions and categories

---

## Default Data

### Default Categories on User Signup

When a new user signs up, a default ledger is created with the following categories:

#### Income Categories

| Name | Icon | Color |
|------|------|-------|
| Salary | 💼 | #27ae60 |
| Freelance | 💻 | #3498db |
| Investment | 📈 | #9b59b6 |
| Gift | 🎁 | #e67e22 |
| Other Income | 💰 | #1abc9c |

#### Expense Categories

| Name | Icon | Color |
|------|------|-------|
| Food & Dining | 🍔 | #e74c3c |
| Transportation | 🚗 | #f39c12 |
| Shopping | 🛒 | #9b59b6 |
| Entertainment | 🎬 | #3498db |
| Bills & Utilities | 📱 | #e67e22 |
| Healthcare | 🏥 | #1abc9c |
| Education | 📚 | #34495e |
| Other Expense | 💸 | #95a5a6 |

---

## Database Migrations

### Initial Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or use migrations
npx prisma migrate dev --name init
```

### Viewing Database

```bash
# Open Prisma Studio
npx prisma studio
```

---

## Performance Considerations

### Query Optimization

1. **Indexed Queries**: All foreign keys and frequently queried fields are indexed
2. **Selective Loading**: Use Prisma's `select` and `include` to fetch only needed data
3. **Pagination**: Limit large result sets (e.g., activity logs limited to 100 entries)

### Storage Optimization

1. **Receipt Images**: Compressed to WebP format before storage
2. **Base64 Encoding**: Allows direct embedding in JSON responses
3. **Cleanup Operations**: Bulk delete endpoint for clearing receipt images

### Recommended Indexes for Production

```prisma
// Additional indexes for production
@@index([createdAt]) // For Transaction table
@@index([createdAt]) // For ActivityLog table
```

---

## Security Considerations

### Data Protection

1. **Password Hashing**: Bcrypt with 12 rounds
2. **Session Management**: JWT tokens via NextAuth
3. **Access Control**: Row-level security through Prisma queries
4. **Cascade Deletes**: Automatic cleanup of orphaned records

### Audit Trail

- All major operations logged in ActivityLog
- Includes user, action, timestamp, and affected entity
- Useful for debugging and compliance

---

## Backup and Recovery

### Recommended Backup Strategy

1. **Daily Backups**: Automated PostgreSQL backups
2. **Export Feature**: Users can export their data as JSON
3. **Point-in-Time Recovery**: Supported by PostgreSQL

### Data Export Format

```json
{
  "transactions": [...],
  "categories": [...],
  "exportDate": "2024-01-15T10:30:00.000Z"
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial schema with multi-user support |

---

## Schema Evolution Guidelines

When modifying the schema:

1. **Always create migrations** for production databases
2. **Test migrations** on a copy of production data
3. **Update this documentation** with schema changes
4. **Version the schema** using semantic versioning
5. **Consider backwards compatibility** for API clients

---

## Prisma Schema Reference

For the complete Prisma schema definition, see: `prisma/schema.prisma`
