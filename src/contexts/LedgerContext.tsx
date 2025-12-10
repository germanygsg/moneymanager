'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Ledger {
    id: string;
    name: string;
    currency: string;
    ownerId: string;
    isOwner: boolean;
    role?: string; // 'viewer' or 'editor' for shared ledgers
    owner?: {
        username: string;
    };
}

interface LedgerContextType {
    currentLedger: Ledger | null;
    availableLedgers: Ledger[];
    isLoading: boolean;
    switchLedger: (ledgerId: string) => void;
    refreshLedgers: () => Promise<void>;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

export function LedgerProvider({ children }: { children: React.ReactNode }) {
    const [currentLedger, setCurrentLedger] = useState<Ledger | null>(null);
    const [availableLedgers, setAvailableLedgers] = useState<Ledger[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLedgers = useCallback(async (emitEvent = false) => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/ledgers');
            if (response.ok) {
                const ledgers = await response.json();
                setAvailableLedgers(ledgers);

                // Get user preferences from database
                const prefsResponse = await fetch('/api/user/preferences');
                let savedLedgerId: string | null = null;

                if (prefsResponse.ok) {
                    const prefs = await prefsResponse.json();
                    savedLedgerId = prefs.currentLedgerId;
                }

                // Set current ledger from database preference or default to first ledger
                const ledgerToSet = savedLedgerId
                    ? ledgers.find((l: Ledger) => l.id === savedLedgerId)
                    : ledgers[0];

                if (ledgerToSet) {
                    setCurrentLedger(ledgerToSet);

                    // Save to database if it's different from saved preference
                    if (ledgerToSet.id !== savedLedgerId) {
                        await fetch('/api/user/preferences', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ currentLedgerId: ledgerToSet.id }),
                        });
                    }

                    // Emit event if requested (for currency sync)
                    if (emitEvent) {
                        window.dispatchEvent(new CustomEvent('ledgerChanged', { detail: ledgerToSet }));
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching ledgers:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLedgers(true); // Emit event on initial load to sync currency
    }, [fetchLedgers]);

    const switchLedger = useCallback(async (ledgerId: string) => {
        const ledger = availableLedgers.find(l => l.id === ledgerId);
        if (ledger) {
            setCurrentLedger(ledger);

            // Save to database
            await fetch('/api/user/preferences', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentLedgerId: ledger.id }),
            });

            // Trigger a custom event to notify other components
            window.dispatchEvent(new CustomEvent('ledgerChanged', { detail: ledger }));
        }
    }, [availableLedgers]);

    const refreshLedgers = useCallback(async () => {
        await fetchLedgers(true); // Emit event to notify about ledger changes (e.g., currency updates)
    }, [fetchLedgers]);

    return (
        <LedgerContext.Provider value={{
            currentLedger,
            availableLedgers,
            isLoading,
            switchLedger,
            refreshLedgers
        }}>
            {children}
        </LedgerContext.Provider>
    );
}

export function useLedger() {
    const context = useContext(LedgerContext);
    if (context === undefined) {
        throw new Error('useLedger must be used within a LedgerProvider');
    }
    return context;
}
