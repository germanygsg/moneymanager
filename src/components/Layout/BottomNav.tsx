'use client';

import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, alpha } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { pastelColors } from '@/theme/theme';

// Original menu items - unchanged
const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Transactions', icon: <ReceiptIcon />, path: '/transactions' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const theme = useMuiTheme();
    const isDark = theme.palette.mode === 'dark';

    const currentIndex = menuItems.findIndex(item => item.path === pathname);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        router.push(menuItems[newValue].path);
    };

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                display: { xs: 'block', sm: 'none' },
                zIndex: (theme) => theme.zIndex.appBar,
                borderRadius: 0,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                overflow: 'hidden',
            }}
            elevation={8}
        >
            <BottomNavigation
                value={currentIndex}
                onChange={handleChange}
                showLabels
                sx={{
                    height: 70,
                    bgcolor: isDark ? 'background.paper' : '#ffffff',
                    '& .MuiBottomNavigationAction-root': {
                        color: 'text.secondary',
                        minWidth: 'auto',
                        py: 1.5,
                        transition: 'all 0.2s ease',
                        '& .MuiBottomNavigationAction-label': {
                            fontSize: '0.65rem',
                            fontWeight: 500,
                            mt: 0.5,
                            transition: 'all 0.2s ease',
                        },
                        '& .MuiSvgIcon-root': {
                            fontSize: 24,
                            transition: 'all 0.2s ease',
                        },
                        '&.Mui-selected': {
                            color: isDark ? 'primary.main' : pastelColors.sidebarDark,
                            '& .MuiBottomNavigationAction-label': {
                                fontSize: '0.7rem',
                                fontWeight: 600,
                            },
                            '& .MuiSvgIcon-root': {
                                fontSize: 26,
                                background: isDark
                                    ? alpha(pastelColors.lavender, 0.2)
                                    : pastelColors.lavenderLight,
                                borderRadius: 2,
                                p: 0.5,
                            },
                        },
                    },
                }}
            >
                {menuItems.map((item) => (
                    <BottomNavigationAction
                        key={item.text}
                        label={item.text}
                        icon={item.icon}
                    />
                ))}
            </BottomNavigation>
        </Paper>
    );
}
