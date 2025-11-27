'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { theme, darkTheme } from '@/theme/theme';

interface ThemeContextType {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    darkMode: false,
    toggleDarkMode: () => { },
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
    children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
    const [darkMode, setDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Load dark mode preference from localStorage on mount
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        const timer = setTimeout(() => {
            if (savedDarkMode !== null) {
                setDarkMode(savedDarkMode === 'true');
            }
            setMounted(true);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    // Save dark mode preference to localStorage whenever it changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('darkMode', darkMode.toString());
        }
    }, [darkMode, mounted]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    // Prevent flash of wrong theme
    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            <MuiThemeProvider theme={darkMode ? darkTheme : theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}
