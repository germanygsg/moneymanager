'use client';

import React from 'react';
import { Box, Container, Typography, Card, CardContent, Chip } from '@mui/material';
import Layout from '@/components/Layout/Layout';
import { useTransactions } from '@/hooks/useTransactions';

export default function CategoriesPage() {
    const { categories } = useTransactions();

    return (
        <Layout onAddTransaction={() => { }} showAddButton={false}>
            <Container maxWidth="xl">
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                    Categories
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
                    {categories.map((category) => (
                        <Card key={category.id} sx={{ borderLeft: `6px solid ${category.color}` }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6">{category.name}</Typography>
                                    <Chip
                                        label={category.type}
                                        color={category.type === 'Income' ? 'success' : 'error'}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Container>
        </Layout>
    );
}
