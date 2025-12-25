'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import {
    AppBar as MuiAppBar,
    Toolbar,
    Typography,
    IconButton,
    Button,
    Box,
    Popover,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LedgerSwitcher from './LedgerSwitcher';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { pastelColors } from '@/theme/theme';
import ActivityLogs from '@/components/Logs/ActivityLogs';

interface AppBarProps {
    onAddClick: () => void;
    darkMode: boolean;
    onToggleDarkMode: () => void;
    showAddButton?: boolean;
    sidebarCollapsed: boolean;
    onToggleSidebar: () => void;
}

export default function AppBar({
    onAddClick,
    darkMode,
    onToggleDarkMode,
    showAddButton = true,
    sidebarCollapsed,
    onToggleSidebar,
}: AppBarProps) {
    const theme = useMuiTheme();
    const isDark = theme.palette.mode === 'dark';
    const [logsAnchorEl, setLogsAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleLogsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setLogsAnchorEl(event.currentTarget);
    };

    const handleLogsClose = () => {
        setLogsAnchorEl(null);
    };

    const openLogs = Boolean(logsAnchorEl);

    return (
        <MuiAppBar
            position="fixed"
            elevation={0}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                bgcolor: isDark ? 'background.paper' : '#ffffff',
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0',
                boxShadow: 'none',
            }}
        >
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1.5 }}>
                    <Image
                        src="/logo.png"
                        alt="ONLINE LEDGER Logo"
                        width={32}
                        height={32}
                        style={{ borderRadius: '4px' }}
                    />
                    <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                        ONLINE LEDGER
                    </Typography>

                    {/* Sidebar Toggle Button - Desktop only */}
                    <IconButton
                        onClick={onToggleSidebar}
                        sx={{
                            display: { xs: 'none', sm: 'flex' },
                            ml: 1,
                            color: 'text.secondary',
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#f5f5f8',
                            },
                        }}
                    >
                        {sidebarCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
                    </IconButton>
                </Box>

                <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>

                    <IconButton
                        onClick={handleLogsClick}
                        color="inherit"
                        sx={{
                            mr: 1,
                            height: 40,
                            width: 40,
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#f5f5f8',
                            },
                        }}
                    >
                        <NotificationsIcon />
                    </IconButton>

                    <IconButton
                        onClick={onToggleDarkMode}
                        color="inherit"
                        sx={{
                            mr: 2,
                            height: 40,
                            width: 40,
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#f5f5f8',
                            },
                        }}
                    >
                        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>

                    <Box sx={{ mr: 2 }}>
                        <LedgerSwitcher />
                    </Box>

                    {showAddButton && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={onAddClick}
                            sx={{
                                height: 40,
                                borderRadius: 2,
                                background: isDark
                                    ? 'linear-gradient(135deg, #a882ff 0%, #8860e6 100%)'
                                    : `linear-gradient(135deg, ${pastelColors.sidebarDark} 0%, #16213e 100%)`,
                                '&:hover': {
                                    background: isDark
                                        ? 'linear-gradient(135deg, #8860e6 0%, #a882ff 100%)'
                                        : `linear-gradient(135deg, #16213e 0%, ${pastelColors.sidebarDark} 100%)`,
                                },
                            }}
                        >
                            Add Transaction
                        </Button>
                    )}
                </Box>

                {/* Mobile View */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto', gap: 1 }}>
                    <IconButton
                        onClick={handleLogsClick}
                        color="inherit"
                        sx={{
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#f5f5f8',
                            },
                        }}
                    >
                        <NotificationsIcon />
                    </IconButton>

                    <IconButton
                        onClick={onToggleDarkMode}
                        color="inherit"
                        sx={{
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#f5f5f8',
                            },
                        }}
                    >
                        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>

                    {showAddButton && (
                        <IconButton
                            color="primary"
                            onClick={onAddClick}
                            sx={{
                                bgcolor: isDark ? 'primary.main' : pastelColors.sidebarDark,
                                color: 'white',
                                '&:hover': {
                                    bgcolor: isDark ? 'primary.dark' : '#16213e',
                                },
                            }}
                        >
                            <AddIcon />
                        </IconButton>
                    )}
                </Box>

                <Popover
                    open={openLogs}
                    anchorEl={logsAnchorEl}
                    onClose={handleLogsClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    slotProps={{
                        paper: {
                            sx: { mt: 1.5, borderRadius: 2, boxShadow: theme.shadows[3] }
                        }
                    }}
                >
                    <ActivityLogs />
                </Popover>
            </Toolbar>
        </MuiAppBar>
    );
}
