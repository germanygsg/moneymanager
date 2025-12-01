import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/transactions - Get all transactions for the authenticated user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get transactions from user's ledgers and shared ledgers
        const userLedgers = await prisma.ledger.findMany({
            where: {
                ownerId: session.user.id
            },
            select: {
                id: true
            }
        });

        const sharedLedgers = await prisma.ledgerUser.findMany({
            where: {
                userId: session.user.id
            },
            select: {
                ledgerId: true
            }
        });

        const allLedgerIds = [
            ...userLedgers.map((ledger: any) => ledger.id),
            ...sharedLedgers.map((lu: any) => lu.ledgerId)
        ];

        if (allLedgerIds.length === 0) {
            return NextResponse.json([]);
        }

        const transactions = await prisma.transaction.findMany({
            where: {
                ledgerId: {
                    in: allLedgerIds
                }
            },
            include: {
                category: true
            },
            orderBy: {
                date: 'desc'
            }
        });

        // Format transactions to match frontend structure
        const formattedTransactions = transactions.map((transaction: any) => ({
            id: transaction.id,
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            date: transaction.date.toISOString().split('T')[0],
            note: transaction.note,
            category: transaction.category.name,
            categoryId: transaction.category.id,
            ledgerId: transaction.ledgerId
        }));

        return NextResponse.json(formattedTransactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { description, amount, type, date, note, categoryId, ledgerId } = body;

        if (!description || !amount || !type || !date || !categoryId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // If no ledgerId provided, use the first available ledger for the user
        let targetLedgerId = ledgerId;
        if (!targetLedgerId) {
            const userLedger = await prisma.ledger.findFirst({
                where: {
                    ownerId: session.user.id
                }
            });
            if (!userLedger) {
                // Create a default ledger if none exists
                const newLedger = await prisma.ledger.create({
                    data: {
                        name: 'My Ledger',
                        currency: 'USD',
                        ownerId: session.user.id
                    }
                });
                targetLedgerId = newLedger.id;
            } else {
                targetLedgerId = userLedger.id;
            }
        }

        // Verify user has access to the ledger and category
        const ledgerAccess = await prisma.ledger.findFirst({
            where: {
                id: targetLedgerId,
                OR: [
                    { ownerId: session.user.id },
                    {
                        sharedWith: {
                            some: {
                                userId: session.user.id
                            }
                        }
                    }
                ]
            }
        });

        if (!ledgerAccess) {
            return NextResponse.json({ error: 'Ledger not found or access denied' }, { status: 404 });
        }

        const categoryAccess = await prisma.category.findFirst({
            where: {
                id: categoryId,
                ledgerId: targetLedgerId
            }
        });

        if (!categoryAccess) {
            return NextResponse.json({ error: 'Category not found or access denied' }, { status: 404 });
        }

        const transaction = await prisma.transaction.create({
            data: {
                description,
                amount: parseFloat(amount),
                type,
                date: new Date(date),
                note,
                categoryId,
                ledgerId: targetLedgerId
            },
            include: {
                category: true
            }
        });

        // Format the response
        const formattedTransaction = {
            id: transaction.id,
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            date: transaction.date.toISOString().split('T')[0],
            note: transaction.note,
            category: transaction.category.name,
            categoryId: transaction.category.id,
            ledgerId: transaction.ledgerId
        };

        return NextResponse.json(formattedTransaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}