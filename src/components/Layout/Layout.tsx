'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@/components/ThemeProvider/ThemeProvider';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import AppBar from './AppBar';
import Sidebar, { drawerWidth, collapsedWidth } from './Sidebar';
import BottomNav from './BottomNav';

interface LayoutProps {
    children: React.ReactNode;
    onAddTransaction: () => void;
    showAddButton?: boolean;
}

// AppBar height: 56px on mobile, 64px on desktop
const appBarHeight = { xs: 56, sm: 64 };

export default function Layout({ children, onAddTransaction, showAddButton = true }: LayoutProps) {
    const { darkMode, toggleDarkMode } = useTheme();
    const theme = useMuiTheme();
    const isDark = theme.palette.mode === 'dark';
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Initialize state from localStorage
    React.useEffect(() => {
        const stored = localStorage.getItem('sidebarCollapsed');
        if (stored !== null) {
            setSidebarCollapsed(stored === 'true');
        }
    }, []);

    const handleToggleSidebar = () => {
        const newState = !sidebarCollapsed;
        setSidebarCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', String(newState));
    };

    const currentSidebarWidth = sidebarCollapsed ? collapsedWidth : drawerWidth;

    return (
        <Box sx={{
            display: 'flex',
            height: '100vh',
            overflow: 'hidden',
            bgcolor: isDark ? 'background.default' : '#fafbfc',
        }}>
            <AppBar
                onAddClick={onAddTransaction}
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
                showAddButton={showAddButton}
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={handleToggleSidebar}
            />
            <Sidebar collapsed={sidebarCollapsed} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { sm: `calc(100% - ${currentSidebarWidth}px)` },
                    height: '100vh',
                    pt: { xs: `${appBarHeight.xs}px`, sm: `${appBarHeight.sm}px` },
                    overflow: 'auto',
                    bgcolor: isDark ? 'background.default' : '#fafbfc',
                    transition: 'width 0.2s ease',
                }}
            >
                <Box sx={{
                    p: { xs: 2, sm: 3 },
                    pb: { xs: 10, sm: 3 },
                }}>
                    {children}
                </Box>
            </Box>
            <BottomNav />
        </Box>
    );
}
