'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Currency {
    code: string;
    symbol: string;
    name: string;
    locale: string;
}

export const CURRENCIES: Currency[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
    { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
    { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID' },
];

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[4]); // Default to IDR

    useEffect(() => {
        // Listen for ledger changes and update currency accordingly
        const handleLedgerChange = (event: Event) => {
            const customEvent = event as CustomEvent;
            const ledger = customEvent.detail;

            if (ledger?.currency) {
                const ledgerCurrency = CURRENCIES.find(c => c.code === ledger.currency);
                if (ledgerCurrency) {
                    setCurrencyState(ledgerCurrency);
                }
            }
        };

        window.addEventListener('ledgerChanged', handleLedgerChange);

        return () => {
            window.removeEventListener('ledgerChanged', handleLedgerChange);
        };
    }, []);

    const setCurrency = (newCurrency: Currency) => {
        setCurrencyState(newCurrency);
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currency.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
