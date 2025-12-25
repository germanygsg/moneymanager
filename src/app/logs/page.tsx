'use client';

import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Divider,
    Box,
    IconButton,
} from '@mui/material';
import Layout from '@/components/Layout/Layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Log {
    id: string;
    message: string;
    createdAt: string;
    action: string;
    ledger?: {
        name: string;
    };
    user?: {
        username: string;
    };
}

export default function LogsPage() {
    const { status } = useSession();
    const router = useRouter();
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    useEffect(() => {
        const fetchLogs = async () => {
            if (status !== 'authenticated') return;

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
    }, [status]);

    if (status === 'loading' || loading) {
        return (
            <Layout onAddTransaction={() => { }} showAddButton={false}>
                <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress />
                </Container>
            </Layout>
        );
    }

    return (
        <Layout onAddTransaction={() => { }} showAddButton={false}>
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                    <IconButton onClick={() => router.back()} sx={{ bgcolor: 'background.paper' }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Shared Ledger Activities
                    </Typography>
                </Box>

                <Paper sx={{ maxWidth: 800 }}>
                    {logs.length > 0 ? (
                        <List>
                            {logs.map((log, index) => (
                                <React.Fragment key={log.id}>
                                    <ListItem alignItems="flex-start" sx={{ px: 3, py: 2 }}>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
                                                    {log.message}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                    {format(new Date(log.createdAt), 'PPpp')}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                    {index < logs.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    ) : (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">
                                No activity logs found.
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Layout>
    );
}
