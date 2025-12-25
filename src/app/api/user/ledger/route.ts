import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/user/ledger - Get the user's first ledger
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the user's first ledger, or create a default one
        let userLedger = await prisma.ledger.findFirst({
            where: {
                ownerId: session.user.id
            },
            include: {
                categories: true
            }
        });

        if (!userLedger) {
            // Create a default ledger with default categories
            userLedger = await prisma.ledger.create({
                data: {
                    name: 'My Ledger',
                    currency: 'USD',
                    ownerId: session.user.id,
                    categories: {
                        create: [
                            { name: 'Food', type: 'Expense', color: '#FF6B6B', icon: 'restaurant' },
                            { name: 'Transport', type: 'Expense', color: '#4ECDC4', icon: 'directions_car' },
                            { name: 'Shopping', type: 'Expense', color: '#FFE66D', icon: 'shopping_cart' },
                            { name: 'Entertainment', type: 'Expense', color: '#A8E6CF', icon: 'movie' },
                            { name: 'Utilities', type: 'Expense', color: '#FF8B94', icon: 'bolt' },
                            { name: 'Healthcare', type: 'Expense', color: '#C7CEEA', icon: 'local_hospital' },
                            { name: 'Salary', type: 'Income', color: '#95E1D3', icon: 'payments' },
                            { name: 'Business', type: 'Income', color: '#F38181', icon: 'business_center' },
                            { name: 'Investment', type: 'Income', color: '#AA96DA', icon: 'trending_up' },
                            { name: 'Other', type: 'Expense', color: '#FCBAD3', icon: 'more_horiz' },
                        ]
                    }
                },
                include: {
                    categories: true
                }
            });
        }

        return NextResponse.json({
            id: userLedger.id,
            name: userLedger.name,
            currency: userLedger.currency,
            categories: userLedger.categories.map((cat) => ({
                id: cat.id,
                name: cat.name,
                type: cat.type,
                color: cat.color,
                icon: cat.icon,
                ledgerId: cat.ledgerId
            }))
        });
    } catch (error) {
        console.error('Error fetching user ledger:', error);
        return NextResponse.json({ error: 'Failed to fetch user ledger' }, { status: 500 });
    }
}