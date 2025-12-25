import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's ledgers and shared ledgers
        const userLedgers = await prisma.ledger.findMany({
            where: { ownerId: session.user.id },
            select: { id: true }
        });

        const sharedLedgers = await prisma.ledgerUser.findMany({
            where: { userId: session.user.id },
            select: { ledgerId: true }
        });

        const allLedgerIds = [
            ...userLedgers.map(l => l.id),
            ...sharedLedgers.map(l => l.ledgerId)
        ];

        if (allLedgerIds.length === 0) {
            return NextResponse.json([]);
        }

        const logs = await prisma.activityLog.findMany({
            where: {
                ledgerId: { in: allLedgerIds }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100 // Limit to reasonable number
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}
