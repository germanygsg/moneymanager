'use client';

import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Toolbar,
    Tooltip,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { pastelColors } from '@/theme/theme';

const drawerWidth = 260;
const collapsedWidth = 72;

// Original menu items - no changes
const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Transactions', icon: <ReceiptIcon />, path: '/transactions' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

interface SidebarProps {
    collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
    const pathname = usePathname();
    const theme = useMuiTheme();
    const isDark = theme.palette.mode === 'dark';

    const isActive = (path: string) => pathname === path;
    const currentWidth = collapsed ? collapsedWidth : drawerWidth;

    const drawer = (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            bgcolor: isDark ? 'background.paper' : pastelColors.sidebarBody,
        }}>
            {/* Spacer for AppBar */}
            <Toolbar />

            {/* Navigation Section */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: collapsed ? 0.5 : 1, pt: 1 }}>
                <List sx={{ py: 0 }}>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <Tooltip title={collapsed ? item.text : ''} placement="right">
                                <ListItemButton
                                    component={Link}
                                    href={item.path}
                                    selected={isActive(item.path)}
                                    sx={{
                                        borderRadius: 2,
                                        mx: collapsed ? 0.5 : 1,
                                        my: 0.3,
                                        py: 1.2,
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        '&.Mui-selected': {
                                            bgcolor: isDark
                                                ? 'rgba(168, 130, 255, 0.15)'
                                                : `${pastelColors.lavenderLight}`,
                                            '&:hover': {
                                                bgcolor: isDark
                                                    ? 'rgba(168, 130, 255, 0.2)'
                                                    : `${pastelColors.lavender}`,
                                            },
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: collapsed ? 0 : 40,
                                            justifyContent: 'center',
                                            color: isDark
                                                ? (isActive(item.path) ? 'primary.main' : 'text.secondary')
                                                : '#1a1a2e',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    {!collapsed && (
                                        <ListItemText
                                            primary={item.text}
                                            sx={{
                                                '& .MuiListItemText-primary': {
                                                    fontSize: '0.875rem',
                                                    fontWeight: isActive(item.path) ? 600 : 500,
                                                    color: isDark
                                                        ? (isActive(item.path) ? 'white' : 'text.secondary')
                                                        : '#1a1a2e',
                                                },
                                            }}
                                        />
                                    )}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{
                width: { sm: currentWidth },
                flexShrink: { sm: 0 },
                transition: 'width 0.2s ease',
            }}
        >
            {/* Desktop drawer - hidden on mobile */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: currentWidth,
                        border: 'none',
                        bgcolor: isDark ? 'background.paper' : pastelColors.sidebarBody,
                        transition: 'width 0.2s ease',
                        overflowX: 'hidden',
                    },
                }}
                open
            >
                {drawer}
            </Drawer>
        </Box>
    );
}

export { drawerWidth, collapsedWidth };
