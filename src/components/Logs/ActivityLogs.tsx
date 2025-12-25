import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, CircularProgress, Divider, Button } from '@mui/material';
import { format } from 'date-fns';
import HistoryIcon from '@mui/icons-material/History';

interface Log {
    id: string;
    message: string;
    createdAt: string;
    action: string;
}

import { useRouter } from 'next/navigation';

export default function ActivityLogs() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/logs');
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data);
                }
            } catch (error) {
                console.error('Failed to fetch logs', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    if (loading) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 300 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (logs.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', minWidth: 300 }}>
                <HistoryIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                    No recent activity logs.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: 350, maxHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, pb: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', zIndex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                    Activity Logs
                </Typography>
            </Box>
            <List sx={{ px: 0, py: 0, flexGrow: 1, overflowY: 'auto' }}>
                {logs.slice(0, 10).map((log, index) => (
                    <React.Fragment key={log.id}>
                        <ListItem alignItems="flex-start" sx={{ px: 2, py: 1.5 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                                        {log.message}
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                        {format(new Date(log.createdAt), 'dd/MM/yy HH:mm')}
                                    </Typography>
                                }
                            />
                        </ListItem>
                        {index < logs.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                ))}
            </List>
            <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Button
                    fullWidth
                    size="small"
                    onClick={() => router.push('/logs')}
                >
                    View All Logs
                </Button>
            </Box>
        </Box>
    );
}
