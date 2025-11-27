'use client';

import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Transactions', icon: <ReceiptIcon />, path: '/transactions' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();

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
            }}
            elevation={3}
        >
            <BottomNavigation
                value={currentIndex}
                onChange={handleChange}
                showLabels
                sx={{
                    bgcolor: 'background.paper',
                    '& .MuiBottomNavigationAction-root': {
                        color: 'text.secondary',
                        '&.Mui-selected': {
                            color: 'primary.main',
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
