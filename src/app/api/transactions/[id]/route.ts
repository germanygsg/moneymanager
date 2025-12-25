import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /api/transactions/[id] - Update a transaction
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { description, amount, type, date, note, categoryId, receiptImage } = body;

        if (!description || !amount || !type || !date || !categoryId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // First verify user has access to this transaction
        const { id } = await params;
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                id,
                ledger: {
                    OR: [
                        { ownerId: session.user.id },
                        {
                            sharedWith: {
                                some: {
                                    userId: session.user.id,
                                    role: 'editor'
                                }
                            }
                        }
                    ]
                }
            },
            include: {
                category: true
            }
        });

        if (!existingTransaction) {
            return NextResponse.json({ error: 'Transaction not found or access denied' }, { status: 404 });
        }

        // Verify category exists and user has access
        const categoryAccess = await prisma.category.findFirst({
            where: {
                id: categoryId,
                ledgerId: existingTransaction.ledgerId
            }
        });

        if (!categoryAccess) {
            return NextResponse.json({ error: 'Category not found or access denied' }, { status: 404 });
        }

        const updatedTransaction = await prisma.transaction.update({
            where: {
                id
            },
            data: {
                description,
                amount: parseFloat(amount),
                type,
                date: new Date(date),
                note,
                categoryId,
                receiptImage: receiptImage !== undefined ? receiptImage : undefined,
            },
            include: {
                category: true
            }
        });

        // Format the response
        const formattedTransaction = {
            id: updatedTransaction.id,
            description: updatedTransaction.description,
            amount: updatedTransaction.amount,
            type: updatedTransaction.type,
            date: updatedTransaction.date.toISOString().split('T')[0],
            note: updatedTransaction.note,
            category: updatedTransaction.category.name,
            categoryId: updatedTransaction.category.id,
            ledgerId: updatedTransaction.ledgerId,
            receiptImage: updatedTransaction.receiptImage,
        };

        return NextResponse.json(formattedTransaction);
    } catch (error) {
        console.error('Error updating transaction:', error);
        return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
    }
}

// DELETE /api/transactions/[id] - Delete a transaction
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // First verify user has access to this transaction
        const { id } = await params;
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                id,
                ledger: {
                    OR: [
                        { ownerId: session.user.id },
                        {
                            sharedWith: {
                                some: {
                                    userId: session.user.id,
                                    role: 'editor'
                                }
                            }
                        }
                    ]
                }
            }
        });

        if (!existingTransaction) {
            return NextResponse.json({ error: 'Transaction not found or access denied' }, { status: 404 });
        }

        await prisma.transaction.delete({
            where: {
                id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
    }
}