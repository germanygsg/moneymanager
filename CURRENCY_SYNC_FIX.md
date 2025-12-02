# Currency Sync Fix for Shared Ledgers

## Problem
When a ledger owner or editor changed the currency setting, the change was only stored in localStorage (client-side) and not in the database. This meant:
- Other users with access to the same ledger didn't see the currency change
- The currency wasn't persisted to the ledger in the database
- Each user had their own local currency preference instead of a shared ledger currency

## Solution

### 1. Created API Endpoint
**File:** `src/app/api/ledger/[id]/currency/route.ts`

- `PATCH /api/ledger/[id]/currency` - Updates the ledger's currency in the database
- Verifies user has permission (owner or editor role)
- Updates the `Ledger` table's `currency` field
- Returns success/error response

### 2. Updated Settings Page (TO DO)
**File:** `src/app/settings/page.tsx`

Changes needed:
1. Import `useLedger` hook
2. Get `currentLedger` and `refreshLedgers` from the hook
3. Update `handleCurrencyChange` to:
   - Call the API endpoint to update ledger currency in database
   - Update local currency state
   - Refresh ledgers to sync changes
   - Show appropriate success/error message

### 3. How It Works Now

**Before:**
```typescript
const handleCurrencyChange = (event: SelectChangeEvent) => {
    const newCurrency = CURRENCIES.find(c => c.code === event.target.value);
    if (newCurrency) {
        setCurrency(newCurrency); // Only updates localStorage
    }
};
```

**After:**
```typescript
const handleCurrencyChange = async (event: SelectChangeEvent) => {
    const newCurrency = CURRENCIES.find(c => c.code === event.target.value);
    if (!newCurrency || !currentLedger) return;

    // Update ledger currency in database
    const response = await fetch(`/api/ledger/${currentLedger.id}/currency`, {
        method: 'PATCH',
        body: JSON.stringify({ currency: newCurrency.code }),
    });

    if (response.ok) {
        setCurrency(newCurrency); // Update local state
        await refreshLedgers(); // Refresh to sync changes
    }
};
```

### 4. Data Flow

1. **User A (owner) changes currency** → API updates database → All users see new currency
2. **User B (editor) changes currency** → API updates database → All users see new currency  
3. **User C (viewer) tries to change** → API rejects (viewers can't edit)

### 5. Currency Sync Mechanism

The `CurrencyContext` already listens to `ledgerChanged` events:
```typescript
useEffect(() => {
    const handleLedgerChange = (event: CustomEvent) => {
        const ledger = event.detail;
        if (ledger?.currency) {
            const ledgerCurrency = CURRENCIES.find(c => c.code === ledger.currency);
            if (ledgerCurrency) {
                setCurrencyState(ledgerCurrency);
            }
        }
    };
    
    window.addEventListener('ledgerChanged', handleLedgerChange);
}, []);
```

When `refreshLedgers()` is called:
1. Fetches updated ledger data from database
2. Updates `currentLedger` state
3. Emits `ledgerChanged` event
4. CurrencyContext catches event and updates currency
5. All components using `useCurrency()` re-render with new currency

## Implementation Status

✅ API endpoint created (`/api/ledger/[id]/currency`)  
⚠️ Settings page update needed (file got corrupted during edit)

## Next Steps

1. Manually update `src/app/settings/page.tsx`:
   - Add `import { useLedger } from '@/contexts/LedgerContext';`
   - Add `const { currentLedger, refreshLedgers } = useLedger();`
   - Replace `handleCurrencyChange` function with the async version above

2. Test the fix:
   - User A changes currency → User B should see it change
   - User B changes currency → User A should see it change
   - Refresh page → Currency persists from database

3. Optional UI improvement:
   - Update currency setting description to indicate it affects all users
   - Disable currency selector for viewers (read-only)

## Files Modified

- ✅ `src/app/api/ledger/[id]/currency/route.ts` (created)
- ⚠️ `src/app/settings/page.tsx` (needs manual update)
- ✅ `src/contexts/CurrencyContext.tsx` (already has sync logic)
- ✅ `src/contexts/LedgerContext.tsx` (already has refresh logic)
