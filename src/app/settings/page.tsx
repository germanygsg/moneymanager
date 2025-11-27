'use client';

import React from 'react';
import { Container, Typography, Paper, List, ListItem, ListItemText, Switch, Divider } from '@mui/material';
import Layout from '@/components/Layout/Layout';

export default function SettingsPage() {
    return (
        <Layout onAddTransaction={() => { }} showAddButton={false}>
            <Container maxWidth="xl">
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                    Settings
                </Typography>

                <Paper sx={{ maxWidth: 600 }}>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="Dark Mode"
                                secondary="Toggle dark/light theme"
                            />
                            <Switch edge="end" disabled checked={false} />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemText
                                primary="Currency"
                                secondary="USD ($)"
                            />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemText
                                primary="Data Management"
                                secondary="Clear all data"
                            />
                        </ListItem>
                    </List>
                </Paper>
            </Container>
        </Layout>
    );
}
