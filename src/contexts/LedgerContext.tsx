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

                // Set current ledger from localStorage or default to first ledger
                const savedLedgerId = localStorage.getItem('current_ledger_id');
                const ledgerToSet = savedLedgerId
                    ? ledgers.find((l: Ledger) => l.id === savedLedgerId)
                    : ledgers[0];

                if (ledgerToSet) {
                    setCurrentLedger(ledgerToSet);
                    localStorage.setItem('current_ledger_id', ledgerToSet.id);

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
        fetchLedgers();
    }, [fetchLedgers]);

    const switchLedger = useCallback((ledgerId: string) => {
        const ledger = availableLedgers.find(l => l.id === ledgerId);
        if (ledger) {
            setCurrentLedger(ledger);
            localStorage.setItem('current_ledger_id', ledger.id);

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
