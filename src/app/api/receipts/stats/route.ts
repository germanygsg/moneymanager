import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/receipts/stats - Get receipt storage statistics for the current ledger
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the user's current ledger
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { currentLedgerId: true }
        });

        if (!user?.currentLedgerId) {
            return NextResponse.json({
                totalReceipts: 0,
                totalSize: 0,
                formattedSize: '0 Bytes'
            });
        }

        // Get all transactions with receipts for this ledger
        const transactions = await prisma.transaction.findMany({
            where: {
                ledgerId: user.currentLedgerId,
                receiptImage: {
                    not: null
                }
            },
            select: {
                id: true,
                receiptImage: true
            }
        });

        // Calculate total size
        let totalSize = 0;
        for (const transaction of transactions) {
            if (transaction.receiptImage) {
                // Calculate base64 size
                const base64 = transaction.receiptImage.split(',')[1];
                if (base64) {
                    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
                    totalSize += (base64.length * 3) / 4 - padding;
                }
            }
        }

        // Format size
        const formatSize = (bytes: number): string => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
        };

        return NextResponse.json({
            totalReceipts: transactions.length,
            totalSize: totalSize,
            formattedSize: formatSize(totalSize)
        });
    } catch (error) {
        console.error('Error fetching receipt stats:', error);
        return NextResponse.json({ error: 'Failed to fetch receipt statistics' }, { status: 500 });
    }
}

// DELETE /api/receipts/stats - Clear all receipt images for the current ledger
export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the user's current ledger
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { currentLedgerId: true }
        });

        if (!user?.currentLedgerId) {
            return NextResponse.json({
                message: 'No ledger selected',
                clearedCount: 0
            });
        }

        // Verify user has owner access to this ledger
        const ledger = await prisma.ledger.findFirst({
            where: {
                id: user.currentLedgerId,
                ownerId: session.user.id
            }
        });

        if (!ledger) {
            return NextResponse.json({
                error: 'Only ledger owners can clear receipt images'
            }, { status: 403 });
        }

        // Clear all receipt images for this ledger
        const result = await prisma.transaction.updateMany({
            where: {
                ledgerId: user.currentLedgerId,
                receiptImage: {
                    not: null
                }
            },
            data: {
                receiptImage: null
            }
        });

        return NextResponse.json({
            message: 'Receipt images cleared successfully',
            clearedCount: result.count
        });
    } catch (error) {
        console.error('Error clearing receipt images:', error);
        return NextResponse.json({ error: 'Failed to clear receipt images' }, { status: 500 });
    }
}
