import { createTheme, alpha } from '@mui/material/styles';

// New color palette inspired by the reference design
const palette = {
    // Soft pastel colors for cards and accents
    mint: '#a8e6cf',          // Soft mint green
    mintDark: '#6dc99b',
    mintLight: '#d4f5e9',
    
    peach: '#ffd3b6',         // Soft peach/salmon
    peachDark: '#ffb088',
    peachLight: '#ffe8db',
    
    lavender: '#dcd3ff',      // Soft lavender/purple
    lavenderDark: '#b5a4ff',
    lavenderLight: '#eeebff',
    
    yellow: '#fff3b0',        // Soft yellow
    yellowDark: '#ffe066',
    yellowLight: '#fff8d6',
    
    sky: '#c4e4ff',           // Soft sky blue
    skyDark: '#8fcbff',
    skyLight: '#e6f4ff',
    
    blush: '#ffc6c6',         // Soft pink/blush
    blushDark: '#ff9999',
    blushLight: '#ffe1e1',

    // Neutral colors
    sidebarDark: '#1a1a2e',   // Dark sidebar header
    sidebarBody: '#f5f5f8',   // Light gray sidebar body
    textPrimary: '#1a1a2e',
    textSecondary: '#6b7280',
};

// Shared typography configuration
const typography = {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    allVariants: {
        fontFamily: '"Inter", "Segoe UI", sans-serif',
    },
    h1: {
        fontSize: '2rem',
        fontWeight: 700,
    },
    h2: {
        fontSize: '1.5rem',
        fontWeight: 600,
    },
    h3: {
        fontSize: '1.25rem',
        fontWeight: 600,
    },
    h4: {
        fontSize: '1.125rem',
        fontWeight: 600,
    },
    h5: {
        fontSize: '1rem',
        fontWeight: 600,
    },
    h6: {
        fontSize: '0.875rem',
        fontWeight: 600,
    },
    body1: {
        fontSize: '0.9375rem',
    },
    body2: {
        fontSize: '0.8125rem',
    },
    button: {
        textTransform: 'none' as const,
        fontWeight: 600,
    },
    caption: {
        fontSize: '0.75rem',
    },
    subtitle1: {
        fontSize: '0.9375rem',
        fontWeight: 500,
    },
    subtitle2: {
        fontSize: '0.8125rem',
        fontWeight: 500,
    },
};

// Shared component overrides
const getComponents = (mode: 'light' | 'dark') => ({
    MuiButton: {
        styleOverrides: {
            root: {
                textTransform: 'none' as const,
                fontWeight: 600,
                borderRadius: 12,
                padding: '10px 20px',
                boxShadow: 'none',
            },
            contained: {
                '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            },
            containedPrimary: {
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                '&:hover': {
                    background: 'linear-gradient(135deg, #16213e 0%, #1a1a2e 100%)',
                },
            },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 16,
                boxShadow: mode === 'light' 
                    ? '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)'
                    : '0 2px 8px rgba(0, 0, 0, 0.3)',
                border: mode === 'light' ? '1px solid #f0f0f0' : 'none',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                '&:hover': {
                    boxShadow: mode === 'light'
                        ? '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.08)'
                        : '0 4px 16px rgba(0, 0, 0, 0.4)',
                },
            },
        },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 16,
            },
        },
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: 12,
                    '& fieldset': {
                        borderColor: mode === 'light' ? '#e5e5e5' : 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                        borderColor: mode === 'light' ? '#d0d0d0' : 'rgba(255, 255, 255, 0.3)',
                    },
                },
            },
        },
    },
    MuiDrawer: {
        styleOverrides: {
            paper: {
                borderRight: 'none',
                boxShadow: '2px 0 12px rgba(0, 0, 0, 0.05)',
            },
        },
    },
    MuiListItemButton: {
        styleOverrides: {
            root: {
                borderRadius: 12,
                margin: '4px 8px',
                padding: '10px 16px',
                '&:hover': {
                    backgroundColor: mode === 'light' 
                        ? 'rgba(0, 0, 0, 0.04)'
                        : 'rgba(255, 255, 255, 0.08)',
                },
                '&.Mui-selected': {
                    backgroundColor: mode === 'light'
                        ? alpha(palette.lavender, 0.5)
                        : 'rgba(168, 130, 255, 0.2)',
                    '&:hover': {
                        backgroundColor: mode === 'light'
                            ? alpha(palette.lavender, 0.6)
                            : 'rgba(168, 130, 255, 0.25)',
                    },
                },
            },
        },
    },
    MuiChip: {
        styleOverrides: {
            root: {
                borderRadius: 8,
                fontWeight: 500,
            },
        },
    },
    MuiFab: {
        styleOverrides: {
            root: {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            },
        },
    },
    MuiBottomNavigation: {
        styleOverrides: {
            root: {
                backgroundColor: mode === 'light' ? '#ffffff' : '#101f32',
                borderTop: mode === 'light' ? '1px solid #f0f0f0' : '1px solid rgba(255, 255, 255, 0.08)',
            },
        },
    },
    MuiBottomNavigationAction: {
        styleOverrides: {
            root: {
                '&.Mui-selected': {
                    color: palette.sidebarDark,
                },
            },
        },
    },
});

export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1a1a2e',
            light: '#383854',
            dark: '#0f0f1a',
        },
        secondary: {
            main: palette.lavenderDark,
            light: palette.lavender,
            dark: '#9580ff',
        },
        success: {
            main: palette.mintDark,
            light: palette.mint,
            dark: '#4db07a',
        },
        error: {
            main: '#e74c3c',
            light: palette.blush,
            dark: '#c0392b',
        },
        warning: {
            main: palette.yellowDark,
            light: palette.yellow,
            dark: '#e6b800',
        },
        info: {
            main: palette.skyDark,
            light: palette.sky,
            dark: '#4da3ff',
        },
        background: {
            default: '#fafbfc',
            paper: '#ffffff',
        },
        text: {
            primary: palette.textPrimary,
            secondary: palette.textSecondary,
        },
        divider: '#f0f0f0',
    },
    typography,
    shape: {
        borderRadius: 12,
    },
    components: getComponents('light'),
});

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#a882ff',
            light: '#c4a8ff',
            dark: '#8860e6',
        },
        secondary: {
            main: palette.lavenderDark,
            light: palette.lavender,
            dark: '#9580ff',
        },
        success: {
            main: palette.mint,
            light: palette.mintLight,
            dark: palette.mintDark,
        },
        error: {
            main: '#ff7675',
            light: palette.blush,
            dark: '#d63031',
        },
        warning: {
            main: palette.yellow,
            light: palette.yellowLight,
            dark: palette.yellowDark,
        },
        info: {
            main: palette.sky,
            light: palette.skyLight,
            dark: palette.skyDark,
        },
        background: {
            default: '#0a0a14',
            paper: '#14142a',
        },
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
        },
        divider: 'rgba(255, 255, 255, 0.08)',
    },
    typography,
    shape: {
        borderRadius: 12,
    },
    components: getComponents('dark'),
});

// Export pastel colors for use in components
export const pastelColors = palette;
