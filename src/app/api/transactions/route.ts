import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { withRLS } from '@/lib/prisma';
import { logActivity } from '@/lib/logger';

// GET /api/transactions - Get all transactions for the authenticated user
// RLS automatically filters to only show transactions from accessible ledgers
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // With RLS enabled, we can simply query all transactions
        // The database will automatically filter based on user access
        const transactions = await withRLS(session.user.id, async (prisma) => {
            return await prisma.transaction.findMany({
                include: {
                    category: true
                },
                orderBy: {
                    date: 'desc'
                }
            });
        });

        // Format transactions to match frontend structure
        const formattedTransactions = transactions.map((transaction) => ({
            id: transaction.id,
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            date: transaction.date.toISOString().split('T')[0],
            note: transaction.note,
            category: transaction.category.name,
            categoryId: transaction.category.id,
            ledgerId: transaction.ledgerId,
            receiptImage: transaction.receiptImage,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
        }));

        return NextResponse.json(formattedTransactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}

// POST /api/transactions - Create a new transaction
// RLS automatically enforces editor permissions
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { description, amount, type, date, note, categoryId, ledgerId, receiptImage } = body;

        if (!description || !amount || !type || !date || !categoryId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Use RLS context for all database operations
        const result = await withRLS(session.user.id, async (prisma) => {
            // If no ledgerId provided, use the first available ledger
            let targetLedgerId = ledgerId;
            if (!targetLedgerId) {
                const userLedger = await prisma.ledger.findFirst({
                    where: { ownerId: session.user.id }
                });
                if (!userLedger) {
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

            // RLS will automatically check if user has editor access
            // If not, the insert will fail with a permission error
            const transaction = await prisma.transaction.create({
                data: {
                    description,
                    amount: parseFloat(amount),
                    type,
                    date: new Date(date),
                    note,
                    categoryId,
                    ledgerId: targetLedgerId,
                    receiptImage: receiptImage || null,
                },
                include: {
                    category: true,
                    ledger: true
                }
            });

            // Log activity
            await logActivity({
                ledgerId: targetLedgerId,
                userId: session.user.id,
                action: 'CREATE',
                entityType: 'TRANSACTION',
                entityId: transaction.id,
                details: `${session.user.username} added a new transaction to ${transaction.ledger.name}`,
            });

            return transaction;
        });

        // Format the response
        const formattedTransaction = {
            id: result.id,
            description: result.description,
            amount: result.amount,
            type: result.type,
            date: result.date.toISOString().split('T')[0],
            note: result.note,
            category: result.category.name,
            categoryId: result.category.id,
            ledgerId: result.ledgerId,
            receiptImage: result.receiptImage,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
        };

        return NextResponse.json(formattedTransaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        // RLS permission errors will be caught here
        if (error instanceof Error && error.message.includes('permission')) {
            return NextResponse.json({ error: 'Access denied: You need editor permissions' }, { status: 403 });
        }
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}