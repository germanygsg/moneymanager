# Currency Sync Fix for Shared Ledgers

## Problem
When a ledger owner or editor changed the currency setting, the change was only stored in localStorage (client-side) and not in the database. This meant:
- Other users with access to the same ledger didn't see the currency change
- The currency wasn't persisted to the ledger in the database
- Each user had their own local currency preference instead of a shared ledger currency

## Solution ✅ COMPLETED

### 1. Created API Endpoint ✅
**File:** `src/app/api/ledger/[id]/currency/route.ts`

- `PATCH /api/ledger/[id]/currency` - Updates the ledger's currency in the database
- Verifies user has permission (owner or editor role)
- Updates the `Ledger` table's `currency` field
- Returns success/error response

### 2. Updated Settings Page ✅
**File:** `src/app/settings/page.tsx`

Changes implemented:
1. ✅ Import `useLedger` hook
2. ✅ Get `currentLedger` and `refreshLedgers` from the hook
3. ✅ Update `handleCurrencyChange` to:
   - Call the API endpoint to update ledger currency in database
   - Update local currency state
   - Refresh ledgers to sync changes
   - Show appropriate success/error message
4. ✅ Updated description to indicate currency affects all users
5. ✅ Disabled currency selector for viewers (read-only)

### 3. How It Works Now

**Implementation:**
```typescript
const handleCurrencyChange = async (event: SelectChangeEvent) => {
    const newCurrencyCode = event.target.value;
    const newCurrency = CURRENCIES.find(c => c.code === newCurrencyCode);
    if (!newCurrency || !currentLedger) {
        return;
    }

    try {
        // Update the ledger's currency in the database
        const response = await fetch(`/api/ledger/${currentLedger.id}/currency`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ currency: newCurrency.code }),
        });

        if (!response.ok) {
            const data = await response.json();
            setSnackbar({ open: true, message: data.error || 'Failed to update currency', severity: 'error' });
            return;
        }

        // Update local currency state
        setCurrency(newCurrency);

        // Refresh ledgers to get updated currency for all users
        await refreshLedgers();

        setSnackbar({ open: true, message: 'Currency updated successfully for all users', severity: 'success' });
    } catch (error) {
        console.error('Error updating currency:', error);
        setSnackbar({ open: true, message: 'An error occurred while updating currency', severity: 'error' });
    }
};
```

### 4. Data Flow

1. **User A (owner) changes currency** → API updates database → All users see new currency within 10 seconds
2. **User B (editor) changes currency** → API updates database → All users see new currency within 10 seconds
3. **User C (viewer) tries to change** → Currency selector is disabled (viewers can't edit)

### 5. Currency Sync Mechanism ✅

The `CurrencyContext` listens to `ledgerChanged` events:
```typescript
useEffect(() => {
    const handleLedgerChange = (event: CustomEvent) => {
        const ledger = event.detail;
        if (ledger?.currency) {
            const ledgerCurrency = CURRENCIES.find(c => c.code === ledger.currency);
            if (ledgerCurrency && ledgerCurrency.code !== currency.code) {
                setCurrencyState(ledgerCurrency);
            }
        }
    };
    
    window.addEventListener('ledgerChanged', handleLedgerChange as EventListener);
    return () => {
        window.removeEventListener('ledgerChanged', handleLedgerChange as EventListener);
    };
}, [initializeCurrency, currency.code]);
```

### 6. Real-time Sync with Polling ✅

**File:** `src/contexts/LedgerContext.tsx`

Added automatic polling to sync changes across users:
```typescript
useEffect(() => {
    fetchLedgers();

    // Poll for ledger updates every 10 seconds to sync changes across users
    const pollInterval = setInterval(() => {
        fetchLedgers(true); // Emit event to sync currency changes
    }, 10000); // 10 seconds

    return () => clearInterval(pollInterval);
}, [fetchLedgers]);
```

When `refreshLedgers()` is called or polling occurs:
1. Fetches updated ledger data from database
2. Updates `currentLedger` state
3. Emits `ledgerChanged` event
4. CurrencyContext catches event and updates currency
5. All components using `useCurrency()` re-render with new currency

## Implementation Status

✅ API endpoint created (`/api/ledger/[id]/currency`)  
✅ Settings page updated with async currency handler
✅ Currency description updated to indicate it affects all users
✅ Currency selector disabled for viewers
✅ Polling mechanism added for real-time sync (10-second interval)
✅ CurrencyContext has sync logic
✅ LedgerContext has refresh logic

## How to Test

1. **Two-user test:**
   - User A changes currency → User B should see it change within 10 seconds
   - User B changes currency → User A should see it change within 10 seconds
   - Refresh page → Currency persists from database

2. **Viewer test:**
   - Invite a user as viewer
   - Viewer should see currency selector disabled
   - Viewer should still see currency updates from owner/editor

3. **Persistence test:**
   - Change currency
   - Close browser completely
   - Reopen → Currency should be the same as set in the ledger

## Files Modified

- ✅ `src/app/api/ledger/[id]/currency/route.ts` (created)
- ✅ `src/app/settings/page.tsx` (updated with async handler, UI improvements)
- ✅ `src/contexts/CurrencyContext.tsx` (already had sync logic)
- ✅ `src/contexts/LedgerContext.tsx` (added polling mechanism)

## Summary

The currency sync issue has been **fully resolved**. Currency changes are now:
- ✅ Stored in the database (not just localStorage)
- ✅ Synced across all users with access to the ledger
- ✅ Updated in real-time (within 10 seconds via polling)
- ✅ Restricted to owners and editors only
- ✅ Properly persisted and restored on page refresh

