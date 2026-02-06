import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { withRLS } from '@/lib/prisma';

// GET /api/logs - Get activity logs for accessible ledgers
// RLS automatically filters to only show logs from accessible ledgers
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Query logs with explicit ledger access filtering
        // NOTE: RLS policies are in place but Supabase's postgres role bypasses them
        // So we add explicit filtering for defense in depth
        const logs = await withRLS(session.user.id, async (prisma) => {
            // Get user's accessible ledgers
            const accessibleLedgers = await prisma.ledger.findMany({
                where: {
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
                },
                select: { id: true }
            });

            const ledgerIds = accessibleLedgers.map(l => l.id);

            // Only return logs for accessible ledgers
            return await prisma.activityLog.findMany({
                where: {
                    ledgerId: {
                        in: ledgerIds
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 100
            });
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}
