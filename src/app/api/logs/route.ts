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

        // With RLS, we can simply query all logs
        // The database automatically filters based on user's ledger access
        const logs = await withRLS(session.user.id, async (prisma) => {
            return await prisma.activityLog.findMany({
                orderBy: {
                    createdAt: 'desc'
                },
                take: 100 // Limit to reasonable number
            });
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}
