import { createTheme } from '@mui/material/styles';

// Shared typography configuration
const typography = {
    fontFamily: '"Inter", sans-serif',
    allVariants: {
        fontFamily: '"Inter", sans-serif',
    },
    h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        fontFamily: '"Inter", sans-serif',
    },
    h2: {
        fontSize: '2rem',
        fontWeight: 600,
        fontFamily: '"Inter", sans-serif',
    },
    h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        fontFamily: '"Inter", sans-serif',
    },
    h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        fontFamily: '"Inter", sans-serif',
    },
    h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        fontFamily: '"Inter", sans-serif',
    },
    h6: {
        fontSize: '1rem',
        fontWeight: 600,
        fontFamily: '"Inter", sans-serif',
    },
    body1: {
        fontFamily: '"Inter", sans-serif',
    },
    body2: {
        fontFamily: '"Inter", sans-serif',
    },
    button: {
        fontFamily: '"Inter", sans-serif',
    },
    caption: {
        fontFamily: '"Inter", sans-serif',
    },
    overline: {
        fontFamily: '"Inter", sans-serif',
    },
    subtitle1: {
        fontFamily: '"Inter", sans-serif',
    },
    subtitle2: {
        fontFamily: '"Inter", sans-serif',
    },
};

// Shared component overrides
const components = {
    MuiButton: {
        styleOverrides: {
            root: {
                textTransform: 'none' as const,
                fontWeight: 600,
                borderRadius: 8,
                padding: '10px 20px',
            },
            contained: {
                boxShadow: 'none',
                '&:hover': {
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                },
            },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 16,
                transition: 'box-shadow 0.3s ease',
            },
        },
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: 8,
                },
            },
        },
    },
    MuiDrawer: {
        styleOverrides: {
            paper: {
                borderRight: 'none',
            },
        },
    },
};

export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#6366f1', // Indigo
            light: '#818cf8',
            dark: '#4f46e5',
        },
        secondary: {
            main: '#ec4899', // Pink
            light: '#f472b6',
            dark: '#db2777',
        },
        success: {
            main: '#10b981', // Green for income
            light: '#34d399',
            dark: '#059669',
        },
        error: {
            main: '#ef4444', // Red for expense
            light: '#f87171',
            dark: '#dc2626',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
    },
    typography,
    shape: {
        borderRadius: 12,
    },
    components: {
        ...components,
        MuiCard: {
            styleOverrides: {
                root: {
                    ...components.MuiCard.styleOverrides.root,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    ...components.MuiDrawer.styleOverrides.paper,
                    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
                },
            },
        },
    },
});

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#818cf8',
            light: '#a5b4fc',
            dark: '#6366f1',
        },
        secondary: {
            main: '#f472b6',
            light: '#f9a8d4',
            dark: '#ec4899',
        },
        success: {
            main: '#34d399',
            light: '#6ee7b7',
            dark: '#10b981',
        },
        error: {
            main: '#f87171',
            light: '#fca5a5',
            dark: '#ef4444',
        },
        background: {
            default: '#030f1c',
            paper: '#101f32',
        },
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
        },
    },
    typography,
    shape: {
        borderRadius: 12,
    },
    components: {
        ...components,
        MuiCard: {
            styleOverrides: {
                root: {
                    ...components.MuiCard.styleOverrides.root,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    ...components.MuiDrawer.styleOverrides.paper,
                    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.3)',
                },
            },
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: '#ffffff',
                },
            },
        },
    },
});
